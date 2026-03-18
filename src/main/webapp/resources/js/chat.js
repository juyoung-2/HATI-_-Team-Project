// 전역 상태 관리
let currentTab = '1:1';
let lastMessageSenderId = null;
let lastMessageTimeStr = null;

//WebSocket 관련
let stompClient = null;
let currentRoomId = null;
let currentMyId = null;
let otherLastReadId = 0;
let isInChatRoom = false;
let roomListPollingInterval = null;
let otherProfileImageUrl = null;
let otherHatiCode = null;
let otherGender = null;

//WebSocket 연결
function connectWebSocket(roomId, myId) {
    if (stompClient !== null && stompClient.connected) {
        disconnectWebSocket();
    }
    
    currentRoomId = roomId;
    currentMyId = myId;
    
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        console.log('WebSocket 연결됨:', frame);
        
        stompClient.subscribe('/queue/' + roomId, function(message) {
        	console.log('수신:', message.body);
            const receivedData = JSON.parse(message.body);
            
            // 수정: 메시지 타입 구분
            if (receivedData.type === 'READ_RECEIPT') {
                // 읽음 알림 처리
                if (receivedData.readerId !== currentMyId) {
                    otherLastReadId = receivedData.lastReadMessageId;
                    updateReadReceipts();  // 화면의 모든 '1' 표시 갱신
                }
            } else if (receivedData.type === 'MESSAGE_DELETED') { 
            	reloadChatMessages(currentRoomId);
            	
            	// 좌측 목록 업데이트
            	if (receivedData.lastMessage) {
                    const roomItem = document.querySelector(`[data-room-id="${receivedData.roomId}"]`);
                    if (roomItem) {
                        const messageEl = roomItem.querySelector('.conversation-message');
                        if (messageEl) {
                            messageEl.textContent = receivedData.lastMessage;
                        }
                    }
                }
            } else {
                // 일반 메시지 처리
                displayNewMessage(receivedData);
                
                // 받은 메시지 즉시 읽음 처리
                if (isInChatRoom) {
                    markAsRead(roomId, receivedData.messageId);
                }
            }
        });
    }, function(error) {
        console.error('WebSocket 연결 실패:', error);
    });
}

// WebSocket 연결 해제
function disconnectWebSocket() {
    if (stompClient !== null) {
        stompClient.disconnect();
        console.log('WebSocket 연결 해제');
    }
}

//채팅 목록 주기적 업데이트 (5초마다)
function startRoomListPolling() {
    // 이미 실행 중이면 중단
    if (roomListPollingInterval) {
        clearInterval(roomListPollingInterval);
    }
    
    roomListPollingInterval = setInterval(() => {
        updateRoomList();
    }, 5000); // 1초
}

//채팅 목록 업데이트
function updateRoomList() {
    fetch('/chat/rooms')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.rooms) {
                refreshRoomList(data.rooms);
            }
        })
        .catch(error => console.error('Error updating room list:', error));
}

// 채팅 목록 새로고침
function refreshRoomList(rooms) {
    const container = document.getElementById('conversations-container');
    if (!container) return;
    
    // 현재 선택된 방 ID 저장
    const currentActiveRoomId = currentRoomId;
    
    // 기존 목록과 비교하여 새로운 방만 추가
    rooms.forEach(room => {
        const existingRoom = container.querySelector(`[data-room-id="${room.roomId}"]`);
        
        if (!existingRoom) {
            // 프로필 정보가 없으면 무시
            if (!room.otherNickname || !room.otherAccountId) {
                console.log('프로필 없는 방 무시:', room.roomId);
                return;
            }
        	
            // 새 채팅방 발견! 맨 위에 추가
            const chatRoomHtml = `
                <div class="conversation-item ${room.isFavorite == 'Y' ? 'favorited' : ''} ${room.isMuted == 1 ? 'muted' : ''}" 
                     data-room-id="${room.roomId}" 
                     data-account-id="${room.otherAccountId}"
                     data-is-favorite="${room.isFavorite}"
                     data-is-muted="${room.isMuted}"
                     onclick="openExistingChat(${room.roomId}, ${room.otherAccountId})">
                    <div class="conversation-content">
                        <div class="avatar">
						    ${room.otherProfileImageUrl 
						        ? `<img src="${room.otherProfileImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
						        : room.otherHatiCode
						            ? `<img src="/resources/img/DefaultProfile/${room.otherHatiCode}_${room.otherGender === 'F' ? 'W' : 'M'}.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.src='/resources/img/DefaultProfile/default.png';">`
						            : (room.otherNickname ? room.otherNickname.substring(0, 1) : '?')
						    }
						</div>
                        <div class="conversation-info">
                            <div class="conversation-header">
                                <div class="conversation-title">
                                    <span class="hati-badge hati-badge--${room.otherHatiCode}">${room.otherHatiCode || ''}</span>
                                    <span class="conversation-name">${room.otherNickname || '사용자'}</span>
                                </div>
                            </div>
                            <p class="conversation-message">${room.lastMessage || '대화를 시작하세요'}</p>
                            <p class="conversation-time">${room.lastMessageTime || '새 대화'}</p>
                        </div>
                    </div>
                </div>
            `;
            
            // 맨 위에 추가
            container.insertAdjacentHTML('afterbegin', chatRoomHtml);
            
            // 빈 메시지 제거
            const emptyMessage = container.querySelector('.chat-empty');
            if (emptyMessage) {
                emptyMessage.remove();
            }
        }   
    });
}

//좌측 채팅방 목록의 마지막 메시지 & 시간 업데이트
function updateChatRoomListItem(roomId, lastMessage, lastMessageTime) {
    const roomItem = document.querySelector(`[data-room-id="${roomId}"]`);
    if (!roomItem) return;
    
    // 마지막 메시지 업데이트
    const messageEl = roomItem.querySelector('.conversation-message');
    if (messageEl) {
        messageEl.textContent = lastMessage;
    }
    
    // 시간 업데이트
    const timeEl = roomItem.querySelector('.conversation-time');
    if (timeEl) {
        const date = new Date(lastMessageTime);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? '오후' : '오전';
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
            timeEl.textContent = `${ampm} ${displayHours}:${displayMinutes}`;
        } else {
            // 어제/날짜 처리 (필요하면 추가)
            timeEl.textContent = '방금';
        }
    }
    
    // 맨 위로 이동
    const container = document.getElementById('conversations-container');
    if (container && roomItem.parentNode === container) {
        container.insertBefore(roomItem, container.firstChild);
    }
}

// 탭 전환
function switchTab(tab) {
    currentTab = tab;
    
    // 탭 버튼 활성화 상태 변경
    const tab11 = document.getElementById('tab-1-1');
    const tabOpen = document.getElementById('tab-opentalk');
    
    if(tab11) tab11.classList.toggle('active', tab === '1:1');
    if(tabOpen) tabOpen.classList.toggle('active', tab === 'opentalk');

    // 목록 표시/숨김
    const userList = document.getElementById('conversations-container');
    const openTalkList = document.getElementById('opentalk-container');
    
    if(userList) userList.classList.toggle('hidden', tab !== '1:1');
    if(openTalkList) openTalkList.classList.toggle('hidden', tab !== 'opentalk');
    
    // 버튼 표시/숨김
    const btn11 = document.getElementById('action-buttons-1-1');
    const btnOpen = document.getElementById('action-buttons-opentalk');
    
    if(btn11) btn11.classList.toggle('hidden', tab !== '1:1');
    if(btnOpen) btnOpen.classList.toggle('hidden', tab !== 'opentalk');
    
    // 채팅 선택 초기화
    selectedChatId = null;
    selectedChatType = null;
    
    const chatEmpty = document.getElementById('chat-empty');
    const chatSelected = document.getElementById('chat-selected');
    
    if(chatEmpty) chatEmpty.classList.remove('hidden');
    if(chatSelected) chatSelected.classList.add('hidden');
    
    // opentalk 탭 진입 시 그룹방 목록 로드
    if (tab === 'opentalk') {
        loadGroupRooms();
    }
    
    // 탭 전환 시 채팅방 종료
    leaveChatRoom();
}

// 채팅방 종료
function leaveChatRoom() {
    isInChatRoom = false;
    disconnectWebSocket();
}

//메시지 전송
function sendMessage() {
    // 그룹채팅 탭이면 groupChat.js의 함수 호출
    if (currentTab === 'opentalk') {
        sendGroupMessage();
        return;
    }
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || !currentRoomId || !stompClient) {
        console.error('전송 조건 불만족!');
        return;
    }
    
    const chatMessage = {
        roomId: currentRoomId,
        senderAccountId: currentMyId,
        content: message
    };
    console.log('전송할 메시지:', chatMessage);
    stompClient.send("/app/chat/send", {}, JSON.stringify(chatMessage));
    
    // 입력창 초기화
    messageInput.value = '';
    updateSendButton();
}

// 키 다운 이벤트 핸들러
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// 전송 버튼 상태 업데이트
function updateSendButton() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const hasMessage = messageInput.value.trim().length > 0;
    
    sendBtn.disabled = !hasMessage;
    sendBtn.style.backgroundColor = hasMessage ? '#1877F2' : '#E4E6EB';
    
    const svg = sendBtn.querySelector('svg');
    if (svg) {
        svg.style.color = hasMessage ? 'white' : '#BCC0C4';
    }
}

// 메시지 입력 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('input', updateSendButton);
    }
});

// New Chat 모달 열기
function openNewChatModal() {
    document.getElementById('newChatOverlay').classList.add('active');
    document.getElementById('newChatModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// New Chat 모달 닫기
function closeNewChatModal() {
    document.getElementById('newChatOverlay').classList.remove('active');
    document.getElementById('newChatModal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('userSearchInput').value = '';
    filterUsers(); // 검색 초기화
}

// 채팅 시작
function startChat(targetUserId) {
	// 기존 채팅방 종료(채팅 읽음 처리 로직을 위한 보험)
	leaveChatRoom();
    console.log('Starting chat with:', targetUserId);
    
    // 서버에 채팅방 생성/조회 요청
    fetch('/chat/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'targetUserId=' + targetUserId
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('채팅방 로드 성공:', data);
            
            // 모달 닫기
            closeNewChatModal();
            
            // 채팅 영역 표시
            document.getElementById('chat-empty').classList.add('hidden');
            document.getElementById('chat-selected').classList.remove('hidden');
            
            // 채팅 헤더 업데이트
            updateChatHeader(data.targetNickname, data.targetHatiCode, data.targetProfileImageUrl, data.targetGender);
            
            // 상대방의 읽음 정보 저장
            otherLastReadId = data.otherLastReadId || 0;
            
            // 메시지 히스토리 표시
            displayChatHistory(data.history, data.myId);
            
            // 좌측 목록에 추가
            addChatRoomToList(data.roomId, data.targetNickname, data.targetHatiCode, targetUserId, data.targetProfileImageUrl, data.targetGender);
            
            // WebSocket 연결
            connectWebSocket(data.roomId, data.myId);
            
            // 상대방의 채팅방 진입 여부(읽음 확인용)
            isInChatRoom = true;
            
            // 마지막 메시지까지 읽음 처리
            if(data.history && data.history.length > 0) {
                const lastMsg = data.history[data.history.length - 1];
                markAsRead(data.roomId, lastMsg.messageId);
            }
            
        } else {
            console.error('채팅방 로드 실패:', data.error);
            alert('채팅방을 불러오는데 실패했습니다: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('채팅방을 불러오는데 실패했습니다.');
    });
    
    // 그룹 액션 버튼 숨기기
    document.getElementById('group-chat-actions').classList.add('hidden');
    document.getElementById('memberSidebar').classList.remove('active');
    document.getElementById('chat-hati-badge').style.display = '';
}

//채팅 헤더 업데이트
function updateChatHeader(nickname, hatiCode, profileImageUrl, gender) {
    const chatUserName = document.getElementById('chat-user-name');
    if (chatUserName) chatUserName.textContent = nickname || '사용자';

    const hatiBadge = document.querySelector('.chat-header .hati-badge');
    if (hatiBadge && hatiCode) {
        hatiBadge.textContent = hatiCode;
        hatiBadge.className = `hati-badge hati-badge--${hatiCode}`;
    }

    const avatar = document.querySelector('.chat-header .avatar');
    if (avatar) {
        const ctx = '/resources/img/DefaultProfile';
        if (profileImageUrl) {
            avatar.innerHTML = `<img src="${profileImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else if (hatiCode) {
            const g = gender === 'F' ? 'W' : 'M';
            avatar.innerHTML = `<img src="${ctx}/${hatiCode}_${g}.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.src='${ctx}/default.png';">`;
        } else {
            avatar.textContent = nickname ? nickname.substring(0, 1) : '?';
        }
    }
}

// 채팅 히스토리 표시
function displayChatHistory(history, myId) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    if (!history || history.length === 0) {
        chatMessages.innerHTML = `
            <div class="chat-empty">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p>대화를 시작하세요</p>
            </div>
        `;
        return;
    }
    
    let messagesHtml = '';
    let currentGroup = null;  // 현재 상대방 메시지 그룹
    
    history.forEach((msg, index) => {
        const isMine = msg.senderAccountId === myId;
        const currentTime = formatMessageTime(msg.createdAt);
        
        const prevMsg = index > 0 ? history[index - 1] : null;
        const prevIsMine = prevMsg ? prevMsg.senderAccountId === myId : null;
        const prevTime = prevMsg ? formatMessageTime(prevMsg.createdAt) : null;
        
        
        const isContinuous = (prevIsMine === isMine) && (prevTime === currentTime);
        
        // 메시지 삭제 시  "삭제된 메시지입니다." 표시
        const isDeleted = msg.isDeleted === 'Y';
        const deletedClass = isDeleted ? 'deleted' : '';
        
        // 메시지 타입별 내용 생성
        let messageContent;
        if(isDeleted){
        	messageContent = '삭제된 메시지입니다.';
        }else if (msg.messageType === 'IMAGE'){
        	// 이미지 메시지 (이미지 여러 개를 HTML <img> 태그 문자열로 만들어서 하나의 문자열로 합치는 코드)
        	messageContent = msg.mediaFiles.map(file => 
            	`<img src="${file.url}" class="chat-image" onclick="window.open('${file.url}')" />`
        	).join('');
        }else if (msg.messageType === 'PAYMENT') { //추가
            // 결제 요청 카드
            messageContent = buildPaymentRequestCard(msg.content, msg.senderAccountId, myId);
        }else if (msg.messageType === 'FILE') {
        	 // 파일 메시지 (파일 다운로드 링크를 만들어주는 코드 - 파일 링크 <a> 태그 생성)
            messageContent = msg.mediaFiles.map(file => {
            	
            	// 1. URL 디코딩
                const decodedUrl = decodeURIComponent(file.url);
                
                // 2. 파일명 추출
                const fullFileName = decodedUrl.split('/').pop();
                
                // 3. 첫 번째 '_' 뒤의 내용만 가져오기 (해시코드 제거)
                const fileNameOnly = fullFileName.substring(fullFileName.indexOf('_') + 1);
                
                return `
                <div class="chat-file-wrapper" style="margin-bottom: 5px;">
                	<a href="${file.url}" download class="chat-file">
                    	<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        	<path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    	</svg>
                    	${fileNameOnly}
                	</a>
                </div>`;
            }).join('');

        } else{
        	// 텍스트 메시지
        	messageContent = escapeHtml(msg.content);
        }
        
        if (isMine) {
            // 내 메시지
            const continuousClass = isContinuous ? 'message-continuous' : '';
            const isRead = msg.messageId <= otherLastReadId;
            const readStatusHtml = !isRead ? '<span class="read-status">1</span>' : '';
            const timeHtml = !isContinuous ? `<span class="message-time">${currentTime}</span>` : '';
            
            messagesHtml += `
                <div class="message-sent ${continuousClass}" data-message-id="${msg.messageId}" data-sender-id="${msg.senderAccountId}">
                  <div class="message-meta">
                    ${readStatusHtml}
                    ${timeHtml}
                  </div>
                  <div class="message-bubble ${deletedClass}">
                  	<p>${messageContent}</p>
                  </div>
                </div>
            `;
        } else {
            // 상대방 메시지 (카카오톡 스타일)
            if (!isContinuous) {
                // 이전 그룹 닫기
                if (currentGroup) {
                    messagesHtml += '</div></div>';
                }
                
                // 새 그룹 시작
                messagesHtml += `
                    <div class="message-group">
                        <div class="avatar">${getOtherUserAvatar()}</div>
                        <div class="message-group-content">
                            <div class="message-group-header">${getOtherUserName()}</div>
                `;
                currentGroup = true;
            }
            
            const timeHtml = !isContinuous ? `<span class="message-time">${currentTime}</span>` : '';
            
            // 메시지 추가
            messagesHtml += `
                <div class="message-group-message" data-message-id="${msg.messageId}" data-sender-id="${msg.senderAccountId}">
                    <div class="message-bubble ${deletedClass}">
                    	<p>${messageContent}</p>
                    </div>
                    ${timeHtml}
                </div>
            `;
        }
    });
    
    // 마지막 그룹 닫기
    if (currentGroup) {
        messagesHtml += '</div></div>';
    }
    
    chatMessages.innerHTML = messagesHtml;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

//상대방 닉네임 첫 글자
function getOtherUserAvatar() {
    const ctx = '/resources/img/DefaultProfile';
    if (otherProfileImageUrl) {
        return `<img src="${otherProfileImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }
    if (otherHatiCode) {
        const g = otherGender === 'F' ? 'W' : 'M';
        return `<img src="${ctx}/${otherHatiCode}_${g}.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.src='${ctx}/default.png';">`;
    }
    const nameEl = document.getElementById('chat-user-name');
    const name = nameEl ? nameEl.textContent : '?';
    return name.substring(0, 1);
}

// 상대방 닉네임
function getOtherUserName() {
    const chatUserName = document.getElementById('chat-user-name');
    if (chatUserName && chatUserName.textContent) {
        return chatUserName.textContent;
    }
    return '사용자';
}

//좌측 채팅방 목록에 추가
function addChatRoomToList(roomId, nickname, hatiCode, accountId, profileImageUrl, gender) {
    const container = document.getElementById('conversations-container');
    if (!container) return;
    
    // 이미 있는지 확인
    const existingRoom = container.querySelector(`[data-room-id="${roomId}"]`);
    if (existingRoom) {
        // 이미 있으면 맨 위로 이동만
        container.insertBefore(existingRoom, container.firstChild);
        return;
    }
    
    // 새 채팅방 HTML 생성
    const chatRoomHtml = `
        <div class="conversation-item" 
             data-room-id="${roomId}" 
             data-account-id="${accountId}"
             data-is-favorite="N"
             data-is-muted="0"
             onclick="openExistingChat(${roomId}, ${accountId})">
            <div class="conversation-content">
                <div class="avatar">
			        ${profileImageUrl
			            ? `<img src="${profileImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
			            : hatiCode
			                ? `<img src="/resources/img/DefaultProfile/${hatiCode}_${gender === 'F' ? 'W' : 'M'}.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.src='/resources/img/DefaultProfile/default.png';">`
			                : (nickname ? nickname.substring(0, 1) : '?')
			        }
			    </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <div class="conversation-title">
                        	<span class="hati-badge hati-badge--${hatiCode}">${hatiCode || ''}</span>
                            <span class="conversation-name">${nickname || '사용자'}</span>
                        </div>
                    </div>
                    <p class="conversation-message">대화를 시작하세요</p>
                    <p class="conversation-time">새 대화</p>
                </div>
            </div>
        </div>
    `;
    
    // 맨 위에 추가
    container.insertAdjacentHTML('afterbegin', chatRoomHtml);
    
    // 빈 메시지 제거
    const emptyMessage = container.querySelector('.chat-empty');
    if (emptyMessage) {
        emptyMessage.remove();
    }
}

//새 메시지 화면에 표시
function displayNewMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const currentTime = formatMessageTime(message.createdAt);
    
    const emptyMessage = chatMessages.querySelector('.chat-empty');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    let messageContent;
    if (message.messageType === 'IMAGE') {
        messageContent = message.mediaFiles.map(file => 
            `<img src="${file.url}" class="chat-image" onclick="window.open('${file.url}')" />`
        ).join('');
    } else if (message.messageType === 'PAYMENT') {
        // 결제 요청 카드 추가
        messageContent = buildPaymentRequestCard(message.content, message.senderAccountId, currentMyId);
    } else if (message.messageType === 'FILE') {
        messageContent = message.mediaFiles.map(file => {
        	
        	// 1. URL 디코딩 (공백이나 한글 깨짐 방지)
            const decodedUrl = decodeURIComponent(file.url);
            
            // 2. 경로에서 마지막 파일명만 추출
            const fullFileName = decodedUrl.split('/').pop();
            
            // 3. 첫 번째 '_'를 기준으로 그 뒤의 모든 내용을 가져옴 (해시코드 제거)
            // 예: "uuid_내파일.doc" -> "내파일.doc"
            const fileNameOnly = fullFileName.substring(fullFileName.indexOf('_') + 1);
        	
            return `
             <div class="chat-file-wrapper" style="margin-bottom: 5px;">
	            <a href="${file.url}" download class="chat-file">
	                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
	                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
	                </svg>
	                	${fileNameOnly}
	            </a>
            </div>`;
        }).join('');

    } else {
        messageContent = escapeHtml(message.content);
    }
    
    const isMine = message.senderAccountId === currentMyId;
    
    // 마지막 메시지 확인
    const lastMessage = chatMessages.lastElementChild;
    let isContinuous = false;
    
    if(lastMessage){
        let lastIsMine = lastMessage.classList.contains('message-sent');
        let lastTime = null;
        
        if (lastIsMine) {
            // data-minute 속성에서 가져오기
            lastTime = lastMessage.getAttribute('data-minute');
        } else {
            // 상대방 메시지
            const lastGroupMessage = lastMessage.querySelector('.message-group-message:last-child');
            if (lastGroupMessage) {
                lastTime = lastGroupMessage.getAttribute('data-minute');
            }
        }
        
        console.log('시간 비교:', { lastIsMine, isMine, lastTime, currentTime });
        isContinuous = (lastIsMine === isMine) && (lastTime === currentTime);
    }

    if (isMine) {
        // 내 메시지
        const continuousClass = isContinuous ? 'message-continuous' : '';
        const isRead = message.messageId <= otherLastReadId;
        const readStatusHtml = !isRead ? '<span class="read-status">1</span>' : '';
        const timeHtml = !isContinuous ? `<span class="message-time">${currentTime}</span>` : '';

        const messageHtml = `
            <div class="message-sent ${continuousClass}" data-minute="${currentTime}" data-message-id="${message.messageId}" data-sender-id="${message.senderAccountId}">
                <div class="message-meta">
                    ${readStatusHtml}
                    ${timeHtml}
                </div>
                <div class="message-bubble">
                    <p>${messageContent}</p>
                </div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', messageHtml);
        
    } else {
        // 상대방 메시지 (카카오톡 스타일)
        if (!isContinuous) {
            // 새 그룹 시작
            const groupHtml = `
                <div class="message-group">
                    <div class="avatar">${getOtherUserAvatar()}</div>
                    <div class="message-group-content">
                        <div class="message-group-header">${getOtherUserName()}</div>
                        <div class="message-group-message" data-minute="${currentTime}" data-message-id="${message.messageId}" data-sender-id="${message.senderAccountId}">
                            <div class="message-bubble">
                                <p>${messageContent}</p>
                            </div>
                            <span class="message-time">${currentTime}</span>
                        </div>
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', groupHtml);
            
        } else {
            // 기존 그룹에 추가
            const lastGroup = chatMessages.querySelector('.message-group:last-child .message-group-content');
            if (lastGroup) {
                const messageHtml = `
                    <div class="message-group-message" data-minute="${currentTime}">
                        <div class="message-bubble">
                            <p>${messageContent}</p>
                        </div>
                    </div>
                `;
                lastGroup.insertAdjacentHTML('beforeend', messageHtml);
            }
        }
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 채팅 미리보기에 삭제된 메시지면 "삭제된 메시지입니다." 표시
    let displayContent;
    if (message.isDeleted === 'Y') {
        displayContent = '삭제된 메시지입니다.';
    } else if (message.messageType === 'PAYMENT') {
        displayContent = '결제 요청';
    } else {
        displayContent = message.content;
    }
    
    // 좌측 목록 업데이트
    updateChatRoomListItem(message.roomId, displayContent, message.createdAt);
    
    if (!isMine && message.messageId > otherLastReadId) {
        otherLastReadId = message.messageId;
    }
}


// 채팅방 하이라이트
function highlightChatRoom(roomId){
	const conversationsContainer = document.getElementById('conversations-container');
    if (!conversationsContainer) return;
    
    // 모든 active 제거
    const allItems = conversationsContainer.querySelectorAll('.conversation-item');
    allItems.forEach(item => item.classList.remove('active'));
    
    // 현재 채팅방 하이라이트
    const currentRoom = conversationsContainer.querySelector(`[data-room-id="${roomId}"]`);
    if (currentRoom) {
        currentRoom.classList.add('active');
    }
}

// 기존 채팅방 열기 (목록 클릭 시)
function openExistingChat(roomId, accountId){
	// 기존 채팅방 종료(채팅 읽음 처리 로직을 위한 보험)
	leaveChatRoom();
	console.log('Opening existing chat:', roomId, accountId);
	
	// 서버에 채팅방 정보 요청(팔로우가 안 된 사용자도 표시하기 위함)
	fetch('/chat/room/' + roomId, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
    	if(data.success){
	    	// 모달 닫기 (혹시 열려있으면)
	    	closeNewChatModal();
	    	
	    	// 상대방의 프로필 사진
	    	otherProfileImageUrl = data.targetProfileImageUrl || null;
	    	
	    	// 상대방의 하티코드
	    	otherHatiCode = data.targetHatiCode || null;
	    	
	    	// 상대방의 성별
	    	otherGender = data.targetGender || null;
	    	
	    	// 채팅 영역 표시
	    	document.getElementById('chat-empty').classList.add('hidden');
	        document.getElementById('chat-selected').classList.remove('hidden');
	        
	        // 채팅 헤더 업데이트
	        updateChatHeader(data.targetNickname, data.targetHatiCode, data.targetProfileImageUrl, data.targetGender);
	        
	        // 상대방의 읽음 정보 저장
	        otherLastReadId = data.otherLastReadId || 0;
	        
	        // 메시지 히스토리 표시
	        displayChatHistory(data.history, data.myId);
	        
	        // 좌측 목록 하이라이트
	        highlightChatRoom(roomId);
	        
	        // WebSocket 연결
	        connectWebSocket(roomId, data.myId);
	        
	        // 상대방의 채팅방 진입 여부(읽음 확인용)
            isInChatRoom = true;
            
	        // 마지막 메시지까지 읽음 처리
	        if(data.history && data.history.length > 0) {
	            const lastMsg = data.history[data.history.length - 1];
	            markAsRead(roomId, lastMsg.messageId);
	        }
        
    	} else {
    		alert('채팅방을 불러오는데 실패했습니다.');
    	}
    })
    .catch(error => {
        console.error('Error:', error);
        alert('채팅방을 불러오는데 실패했습니다.');
    });
	
	// 그룹 액션 버튼 숨기기
	document.getElementById('group-chat-actions').classList.add('hidden');
	document.getElementById('memberSidebar').classList.remove('active');
	document.getElementById('chat-hati-badge').style.display = '';
}


//읽음 처리 함수 (DB에 last_read_message_id 업데이트)
function markAsRead(roomId, messageId) {
    fetch('/chat/read', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `roomId=${roomId}&messageId=${messageId}`
    });
}

// 시간 포맷팅
function formatMessageTime(createdAt) {
    if (!createdAt) return '';
    
    const date = new Date(createdAt);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${ampm} ${displayHours}:${displayMinutes}`;
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 사용자 검색 필터
function filterUsers() {
    const searchQuery = document.getElementById('userSearchInput').value.toLowerCase();
    const userItems = document.querySelectorAll('#userList .user-item');
    
    userItems.forEach(item => {
        const userName = item.querySelector('.user-name').textContent.toLowerCase();
        const userUsername = item.querySelector('.user-username').textContent.toLowerCase();
        
        if (userName.includes(searchQuery) || userUsername.includes(searchQuery)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (document.getElementById('newChatModal').classList.contains('active')) {
            closeNewChatModal();
        }
        if (document.getElementById('newGroupChatModal').classList.contains('active')) {
            closeNewGroupChatModal();
        }
    }
});

// 모달 오버레이 클릭 시 모달 닫기 (이벤트 버블링 방지)
document.addEventListener('DOMContentLoaded', function() {
	startRoomListPolling();
    const newChatModal = document.getElementById('newChatModal');
    const newGroupChatModal = document.getElementById('newGroupChatModal');
    
    if (newChatModal) {
        newChatModal.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    
    if (newGroupChatModal) {
        newGroupChatModal.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
});

// 간소화된 화면의 모든 읽음 표시 업데이트(모든 1 제거, 1:1 챗 한정 사용)
function updateReadReceipts() {
    const readStatuses = document.querySelectorAll('.read-status');
    readStatuses.forEach(status => {
        status.remove();
    });
}

//컨텍스트 메뉴 관련 변수
let contextMenuRoomId = null;
let contextMenuElement = null;

// 채팅방 목록 우클릭 이벤트 (chat.jsp 로드 후 실행)
document.addEventListener('DOMContentLoaded', function() {
    const conversationsContainer = document.getElementById('conversations-container');
    
    if (conversationsContainer) {
        conversationsContainer.addEventListener('contextmenu', function(e) {
            // conversation-item 또는 그 자식 요소에서 우클릭했는지 확인
            const chatItem = e.target.closest('.conversation-item');
            
            if (chatItem) {
                e.preventDefault();
                
                contextMenuRoomId = parseInt(chatItem.dataset.roomId);
                showContextMenu(e.pageX, e.pageY, chatItem);
            }
        });
    }
    
    // 컨텍스트 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        const contextMenu = document.getElementById('chatContextMenu');
        if (contextMenu && !contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
});

// 컨텍스트 메뉴 표시
function showContextMenu(x, y, chatItem) {
    const contextMenu = document.getElementById('chatContextMenu');
    if (!contextMenu) return;
    
    contextMenuElement = chatItem;
    
    // 메뉴 텍스트 업데이트
    const isFavorited = chatItem.classList.contains('favorited');
    const isMuted = chatItem.classList.contains('muted');
    
    document.getElementById('favoriteText').textContent = isFavorited ? '상단 고정 해제' : '상단 고정';
    document.getElementById('muteText').textContent = isMuted ? '알림 켜기' : '알림 끄기';
    
    // 위치 설정
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('active');
    
    // 화면 밖으로 나가는지 체크
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (y - rect.height) + 'px';
    }
}

// 컨텍스트 메뉴 숨기기
function hideContextMenu() {
    const contextMenu = document.getElementById('chatContextMenu');
    if (contextMenu) {
        contextMenu.classList.remove('active');
    }
    contextMenuRoomId = null;
    contextMenuElement = null;
}

// 상단 고정 토글
function toggleFavorite() {
    if (!contextMenuRoomId) return;
    
    fetch('/chat/favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `roomId=${contextMenuRoomId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && contextMenuElement) {
            contextMenuElement.classList.toggle('favorited');
            
            // 목록 재정렬 (고정된 방을 맨 위로)
            const container = document.getElementById('conversations-container');
            const allItems = Array.from(container.querySelectorAll('.conversation-item'));
            
            allItems.sort((a, b) => {
                const aFav = a.classList.contains('favorited') ? 0 : 1;
                const bFav = b.classList.contains('favorited') ? 0 : 1;
                return aFav - bFav;
            });
            
            allItems.forEach(item => container.appendChild(item));
        }
        hideContextMenu();
    })
    .catch(error => {
        console.error('Error:', error);
        hideContextMenu();
    });
}

// 알림 토글
function toggleMute() {
    if (!contextMenuRoomId) return;
    
    fetch('/chat/mute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `roomId=${contextMenuRoomId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && contextMenuElement) {
            if (data.isMuted) {
                contextMenuElement.classList.add('muted');
            } else {
                contextMenuElement.classList.remove('muted');
            }
        }
        hideContextMenu();
    })
    .catch(error => {
        console.error('Error:', error);
        hideContextMenu();
    });
}

// 나가기 (컨텍스트 메뉴에서)
function leaveChatRoomFromMenu() {
    if (!contextMenuRoomId) return;
    
    if (!confirm('채팅방에서 나가시겠습니까?')) {
        hideContextMenu();
        return;
    }
    
    fetch('/chat/leave', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `roomId=${contextMenuRoomId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 좌측 목록에서 제거
            if (contextMenuElement) {
                contextMenuElement.remove();
            }
            
            // 현재 열린 방이면 닫기
            if (currentRoomId === contextMenuRoomId) {
                leaveChatRoom();
                document.getElementById('chat-empty').classList.remove('hidden');
                document.getElementById('chat-selected').classList.add('hidden');
            }
            
            alert('채팅방에서 나갔습니다.');
        } else {
            alert('채팅방 나가기 실패: ' + (data.error || '알 수 없는 오류'));
        }
        hideContextMenu();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('채팅방 나가기 실패');
        hideContextMenu();
    });
}

//메시지 컨텍스트 메뉴 관련 변수
let contextMenuMessageElement = null;
let contextMenuMessageId = null;
let contextMenuMessageContent = null;
let contextMenuSenderAccountId = null;

// 메시지 우클릭 이벤트 등록
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatMessages) {
        chatMessages.addEventListener('contextmenu', function(e) {
            // 메시지 말풍선 찾기
            const messageBubble = e.target.closest('.message-bubble');
            
            if (messageBubble) {
                e.preventDefault();
                
                // 메시지 정보 저장
                const messageDiv = messageBubble.closest('.message-sent, .message-group-message');
                contextMenuMessageElement = messageBubble;
                contextMenuMessageId = messageDiv ? messageDiv.dataset.messageId : null;
                contextMenuMessageContent = messageBubble.querySelector('p').textContent;
                contextMenuSenderAccountId = messageDiv ? messageDiv.dataset.senderId : null;
                
                showMessageContextMenu(e.pageX, e.pageY);
            }
        });
    }
    
    // 컨텍스트 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        const contextMenu = document.getElementById('messageContextMenu');
        if (contextMenu && !contextMenu.contains(e.target)) {
            hideMessageContextMenu();
        }
    });
});

// 메시지 컨텍스트 메뉴 표시
function showMessageContextMenu(x, y) {
    const contextMenu = document.getElementById('messageContextMenu');
    if (!contextMenu) return;
    
    // 위치 설정
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('active');
    
    // 화면 밖으로 나가는지 체크
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (y - rect.height) + 'px';
    }
}

// 메시지 컨텍스트 메뉴 숨기기
function hideMessageContextMenu() {
    const contextMenu = document.getElementById('messageContextMenu');
    if (contextMenu) {
        contextMenu.classList.remove('active');
    }
    contextMenuMessageElement = null;
    contextMenuMessageId = null;
    contextMenuMessageContent = null;
    contextMenuSenderAccountId = null;
}

// 1. 복사
function copyMessage() {
    if (!contextMenuMessageContent) return;
    
    navigator.clipboard.writeText(contextMenuMessageContent).then(() => {
        //alert('메시지가 복사되었습니다.');
    }).catch(() => {
        alert('복사에 실패했습니다.');
    });
    
    hideMessageContextMenu();
}

// 2. 신고
function reportMessage() {
    const messageId = contextMenuMessageId;
    const senderId = contextMenuSenderAccountId;
    hideMessageContextMenu();
    if (!messageId || !senderId) return;
    const modal = document.getElementById('chatReportModal');
    modal.dataset.messageId = messageId;
    modal.dataset.senderId = senderId;
    modal.style.display = 'flex';
    document.getElementById('chatReportContent').value = '';
}

function closeChatReportModal() {
    document.getElementById('chatReportModal').style.display = 'none';
}

function submitChatReport() {
    const messageId = document.getElementById('chatReportModal').dataset.messageId;
    const senderId = document.getElementById('chatReportModal').dataset.senderId;
    const content = document.getElementById('chatReportContent').value.trim();
    fetch('/report/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            targetAccountId: Number(senderId),
            targetType: 'CHAT_MESSAGE',
            targetId: Number(messageId),
            content: content || null
        })
    })
    .then(r => r.text())
    .then(data => {
        closeChatReportModal();
        if (data === 'OK' || data === '"OK"') alert('신고가 접수되었습니다.');
        else if (data === 'DUPLICATE_PENDING') alert('이미 신고한 메시지입니다.');
        else alert('신고 처리 중 오류가 발생했습니다.');
    });
}

//3. 삭제
function deleteMessage() {
    if (!contextMenuMessageId) return;
    
    if (!confirm('이 메시지를 삭제하시겠습니까?')) {
        hideMessageContextMenu();
        return;
    }
    // 탭에 따라 API 분기
    const url = currentTab === 'opentalk' ? '/groupchat/delete' : '/chat/delete';
    
    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `messageId=${contextMenuMessageId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 현재 채팅방 다시 로드
            if (currentTab === 'opentalk') {
            	reloadGroupChatMessages(currentGroupRoomId);
            }else if(currentRoomId && currentMyId){
            	reloadChatMessages(currentRoomId);
            }
        } else {
            alert('메시지 삭제 실패: ' + (data.error || '알 수 없는 오류'));
        }
        hideMessageContextMenu();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('메시지 삭제 실패');
        hideMessageContextMenu();
    });
}

// 채팅 메시지 다시 로드
function reloadChatMessages(roomId) {
    fetch(`/chat/messages?roomId=${roomId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayChatHistory(data.history, currentMyId);
            }
        })
        .catch(error => console.error('Error:', error));
}

//이모티콘 데이터
const emojiData = {
    faces: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
    animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔'],
    food: ['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🥝','🍅','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🥤','🧃','🧉','🧊'],
    activities: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'],
    travel: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍️','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🛰️','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','⚓','⛽','🚧','🚦','🚥','🚏','🗺️','🗿','🗽','🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺','🛖','🏠','🏡','🏘️','🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪','🕌','🕍','🛕','🕋','⛩️','🛤️','🛣️'],
    objects: ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🧰','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚙️','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪒','🧽','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🖼️','🛍️','🛒','🎁','🎈','🎏','🎀','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
    symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','♾️','💲','💱','™️','©️','®️','👁️‍🗨️','🔚','🔙','🔛','🔝','🔜','〰️','➰','➿','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬','💭','🗯️','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🕜','🕝','🕞','🕟','🕠','🕡','🕢','🕣','🕤','🕥','🕦','🕧'],
};

let currentEmojiCategory = 'faces';

// 이모티콘 피커 토글
function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    const isActive = picker.classList.toggle('active');
    
    if (isActive) {
        renderEmojis(currentEmojiCategory);
    }
}

// 이모티콘 렌더링
function renderEmojis(category) {
    currentEmojiCategory = category;
    const body = document.getElementById('emojiPickerBody');
    
    const emojis = emojiData[category] || [];
    
    body.innerHTML = emojis.map(emoji => 
        `<button class="emoji-item" onclick="insertEmoji('${emoji}')" type="button">${emoji}</button>`
    ).join('');
    
    // 카테고리 버튼 활성화 상태 업데이트
    document.querySelectorAll('.emoji-category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
}

// 이모티콘 삽입
function insertEmoji(emoji) {
    const messageInput = document.getElementById('messageInput');
    const start = messageInput.selectionStart;
    const end = messageInput.selectionEnd;
    const text = messageInput.value;
    
    messageInput.value = text.substring(0, start) + emoji + text.substring(end);
    messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
    
    messageInput.focus();
    updateSendButton();
}

// 이모티콘 피커 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    const picker = document.getElementById('emojiPicker');
    const emojiBtn = document.getElementById('emojiBtn');
    
    if (picker && emojiBtn && 
        !picker.contains(e.target) && 
        !emojiBtn.contains(e.target)) {
        picker.classList.remove('active');
    }
});

// 카테고리 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.emoji-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            renderEmojis(this.dataset.category);
        });
    });
});

//파일 타입 선택 모달 열기
function openFileTypeModal() {
    document.getElementById('fileTypeOverlay').classList.add('active');
    document.getElementById('fileTypeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 파일 타입 선택 모달 닫기
function closeFileTypeModal() {
    document.getElementById('fileTypeOverlay').classList.remove('active');
    document.getElementById('fileTypeModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 파일 타입 선택
function selectFileType(type) {
    closeFileTypeModal();
    
    if (type === 'image') {
        document.getElementById('imageInput').click();
    } else {
        document.getElementById('fileInput').click();
    }
}

// 파일 선택 처리
function handleFileSelect(event, type) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // 파일 업로드 진행
    uploadChatFiles(files, type);
    
    // input 초기화
    event.target.value = '';
}

//파일 업로드 함수
function uploadChatFiles(files, type) {
	
	// 탭에 따라 roomId와 url 분기
    const roomId = currentTab === 'opentalk' ? currentGroupRoomId : currentRoomId;
    const url = currentTab === 'opentalk' ? '/groupchat/upload' : '/chat/upload';
    
    if (!roomId || !files || files.length === 0) {
        console.error('업로드 조건 불만족');
        return;
    }
    
    const formData = new FormData();
    formData.append('roomId', roomId);
    
    // 서버에 타입을 알림 (image || file)
    formData.append('type', type);
    
    // 파일들 추가
    files.forEach(file => {
        formData.append('files', file);
    });
    
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('업로드 성공:', data.message);
            // WebSocket으로 자동 전송되므로 추가 작업 불필요
        } else {
            alert('업로드 실패: ' + (data.error || '알 수 없는 오류'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('파일 업로드 실패');
    });
}

/* ============================================================
PAYMENT_REQUEST 메시지 카드 렌더러
- content: PaymentServiceImpl.buildPaymentMessageJson() 반환 JSON 문자열
- senderAccountId: 메시지를 보낸 계정 (트레이너)
- viewerId: 현재 보고 있는 계정 (나)
============================================================ */
function buildPaymentRequestCard(contentJson, senderAccountId, viewerId) {
 let data = {};
 try { data = JSON.parse(contentJson); } catch (e) { return '<p>결제 요청 정보를 불러올 수 없습니다.</p>'; }

 const payType       = data.payType;          // 'FIRST' | 'PASS_USE'
 const reservationId = data.reservationId;
 const paymentId     = data.paymentId;
 const centerName    = data.centerName    || '';
 const schedule      = data.schedule      || '';
 const roomFee       = Number(data.roomFee  || 0);
 const ptFee         = Number(data.ptFee    || 0);
 const totalFee      = Number(data.totalFee || 0);
 const finalAmount   = Number(data.finalAmount || 0);
 const trainerName   = data.trainerName   || '';
 const requirements  = data.requirements  || '';
 const centerId      = data.centerId      || '';

 const isSender = (senderAccountId === viewerId); // 트레이너 본인이면 true

 const fmtNum = n => n.toLocaleString('ko-KR');

 /* ── PASS_USE: 이용권 차감 카드 ── */
 if (payType === 'PASS_USE') {
     const btnHtml = isSender
         ? `<div class="pr-sent-badge"><i class="fa-solid fa-paper-plane"></i> 결제 요청 발송됨</div>`
         : `<button class="pr-btn pr-btn-pass" onclick="confirmPassUse(${paymentId}, this)">
              <i class="fa-solid fa-ticket"></i> 이용권 사용 확인
            </button>`;

     return `
     <div class="pay-req-card pay-req-pass">
       <div class="pr-badge pr-badge-pass">
         <i class="fa-solid fa-ticket-simple"></i> 이용권 차감
       </div>
       <div class="pr-center-row">
         <div class="pr-center-thumb">
           <img src="/resources/img/room/${centerId}/main.jpg"
                onerror="this.src='/resources/img/default_center.jpg'" alt="">
         </div>
         <div>
           <div class="pr-center-name">${escapeHtml(centerName)}</div>
           <div class="pr-schedule">${escapeHtml(schedule)}</div>
         </div>
       </div>
       ${requirements ? `<div class="pr-requirements">"${escapeHtml(requirements)}"</div>` : ''}
       <div class="pr-price-rows">
         <div class="pr-price-row"><span>방 이용료</span><span>${fmtNum(roomFee)}원</span></div>
         <div class="pr-price-row pr-muted"><span>PT (이용권 차감)</span><span>−${fmtNum(ptFee > 0 ? ptFee : 0)}원</span></div>
         <div class="pr-price-row pr-total"><span>실 결제 금액</span><span class="pr-zero">0원</span></div>
       </div>
       ${btnHtml}
     </div>`;
 }

 /* ── FIRST: 신규 이용권 구매 결제 카드 ── */
 const btnHtml = isSender
     ? `<div class="pr-sent-badge"><i class="fa-solid fa-paper-plane"></i> 결제 요청 발송됨</div>`
     : `<button class="pr-btn pr-btn-pay" onclick="openPtPayPopup(${paymentId})">
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
               onerror="this.style.display='none'" style="width:22px;height:22px;vertical-align:middle;margin-right:4px;">
          카카오페이로 결제하기
        </button>`;

 return `
 <div class="pay-req-card pay-req-first">
   <div class="pr-badge pr-badge-first">
     <i class="fa-solid fa-credit-card"></i> 결제 요청
   </div>
   <div class="pr-center-row">
     <div class="pr-center-thumb">
       <img src="/resources/img/room/${centerId}/main.jpg"
            onerror="this.src='/resources/img/default_center.jpg'" alt="">
     </div>
     <div>
       <div class="pr-center-name">${escapeHtml(centerName)}</div>
       <div class="pr-schedule">${escapeHtml(schedule)}</div>
     </div>
   </div>
   ${requirements ? `<div class="pr-requirements">"${escapeHtml(requirements)}"</div>` : ''}
   <div class="pr-price-rows">
     <div class="pr-price-row"><span>방 이용료</span><span>${fmtNum(roomFee)}원</span></div>
     <div class="pr-price-row"><span>PT 이용권</span><span>${fmtNum(ptFee)}원</span></div>
     <div class="pr-price-row pr-total"><span>총 결제 금액</span><span>${fmtNum(finalAmount)}원</span></div>
   </div>
   ${btnHtml}
 </div>`;
}

/* ── 이용권 차감 확인 요청 ── */
function confirmPassUse(paymentId, btnEl) {
 if (!confirm('이용권을 차감하고 예약을 확정하시겠습니까?')) return;
 btnEl.disabled = true;
 btnEl.textContent = '처리 중...';

 // payment.account_id 로 소유권 검증, reservationId는 서버에서 조회
 fetch('/payment/pass-confirm', {
     method:  'POST',
     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
     body:    'paymentId=' + paymentId
 })
 .then(r => r.json())
 .then(data => {
     if (data.success) {
         // 버튼 → 완료 표시로 교체
         const card = btnEl.closest('.pay-req-card');
         btnEl.outerHTML = `
             <div class="pr-done-badge">
               <i class="fa-solid fa-circle-check"></i> 이용권 차감 완료 · 예약 확정
             </div>`;
     } else {
         alert(data.message || '처리에 실패했습니다.');
         btnEl.disabled = false;
         btnEl.innerHTML = '<i class="fa-solid fa-ticket"></i> 이용권 사용 확인';
     }
 })
 .catch(() => {
     alert('네트워크 오류가 발생했습니다.');
     btnEl.disabled = false;
     btnEl.innerHTML = '<i class="fa-solid fa-ticket"></i> 이용권 사용 확인';
 });
}

/* ── PT 결제 팝업 열기 (FIRST) ── */
function openPtPayPopup(paymentId) {
 const url = '/payment/pt-request?paymentId=' + paymentId;
 const popup = window.open(url, 'ptPayment',
     'width=500,height=700,scrollbars=yes,resizable=yes');
 if (!popup) {
     // 팝업 차단된 경우 새 탭으로 열기
     window.open(url, '_blank');
 }
}
