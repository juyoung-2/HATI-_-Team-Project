// ================================
// groupChat.js - 그룹채팅 전용
// ================================

// 그룹채팅 전역 상태
let currentGroupRoomId = null;
let currentGroupMyId = null;
let currentGroupIsPrivate = null;
let currentGroupInviteCode = null;
let groupStompClient = null;
let isInGroupChatRoom = false;
let currentGroupBjAccountId = null;
let groupContextMenuRoomId = null;
let groupContextMenuElement = null;

//================================
//0. 아바타 불러오기
//================================

function renderAvatar(member, size) {
    size = size || 40;
    const ctx = '/resources/img/DefaultProfile';
    if (member.profileImageUrl) {
        return `<img src="${member.profileImageUrl}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
    }
    if (member.hatiCode) {
        const genderFile = (member.gender === 'F') ? 'W' : 'M';
        return `<img src="${ctx}/${member.hatiCode}_${genderFile}.png"
                     style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;"
                     onerror="this.onerror=null;this.src='${ctx}/default.png';">`;
    }
    return `<div class="avatar">${(member.senderNickname || member.nickname || '?').substring(0, 1)}</div>`;
}

// ================================
// 1. WebSocket
// ================================

function connectGroupWebSocket(roomId, myId) {
    if (groupStompClient !== null && groupStompClient.connected) {
        disconnectGroupWebSocket();
    }

    currentGroupRoomId = roomId;
    currentGroupMyId = myId;

    const socket = new SockJS('/ws');
    groupStompClient = Stomp.over(socket);
    groupStompClient.connect({}, function(frame) {
        console.log('그룹 WebSocket 연결됨:', frame);

        // 그룹 채팅은 /topic/group/{roomId}
        groupStompClient.subscribe('/topic/group/' + roomId, function(message) {
            console.log('그룹 수신:', message.body);
            const receivedData = JSON.parse(message.body);

            if (receivedData.type === 'SYSTEM') {
                displaySystemMessage(receivedData.content);
                if (currentGroupRoomId) {
                	// 멤버 목록 재갱신
                    loadGroupMembers(currentGroupRoomId);
                }
            } else if (receivedData.type === 'MESSAGE_DELETED') {
                reloadGroupChatMessages(roomId);
            } else if(receivedData.type === 'READ_RECEIPT'){
            	updateGroupReadReceipts(receivedData.readerId, receivedData.lastReadMessageId);
            } else if(receivedData.type === 'KICKED') {
                if (receivedData.targetId === currentGroupMyId) {
                    alert('채팅방에서 추방당했습니다.');
                    // 채팅방 닫고 목록에서 제거
                    disconnectGroupWebSocket();
                    document.getElementById('chat-empty').classList.remove('hidden');
                    document.getElementById('chat-selected').classList.add('hidden');
                    document.getElementById('group-chat-actions').classList.add('hidden');
                    const roomEl = document.querySelector(`#opentalk-container [data-room-id="${currentGroupRoomId}"]`);
                    if (roomEl) roomEl.remove();
                    currentGroupRoomId = null;
                }
            } else {
                displayNewGroupMessage(receivedData);
                if (isInGroupChatRoom) {
                    markGroupAsRead(roomId, receivedData.messageId);
                }
            }
        });
    }, function(error) {
        console.error('그룹 WebSocket 연결 실패:', error);
    });
}

function updateGroupReadReceipts(readerId, lastReadMessageId) {
    if (readerId === currentGroupMyId) return; // 내가 읽은 건 무시

    // 읽힌 메시지들의 읽음 수 1씩 감소
    const messages = document.querySelectorAll('.message-sent');
    messages.forEach(msgEl => {
        const msgId = parseInt(msgEl.getAttribute('data-message-id'));
        if (msgId <= lastReadMessageId) {
            const readStatus = msgEl.querySelector('.read-status');
            if (readStatus) {
                const current = parseInt(readStatus.textContent);
                if (current <= 1) {
                    readStatus.remove(); // 0이 되면 제거
                } else {
                    readStatus.textContent = current - 1;
                }
            }
        }
    });
}

function disconnectGroupWebSocket() {
    if (groupStompClient !== null) {
        groupStompClient.disconnect();
        console.log('그룹 WebSocket 연결 해제');
    }
}

// ================================
// 2. 모달
// ================================

function openNewGroupChatModal() {
    document.getElementById('newGroupChatOverlay').classList.add('active');
    document.getElementById('newGroupChatModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeNewGroupChatModal() {
    document.getElementById('newGroupChatOverlay').classList.remove('active');
    document.getElementById('newGroupChatModal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('groupChatForm').reset();
}

//설정 모달 열기
function openGroupSettingModal() {
    // 현재 채팅방 정보 세팅
    document.getElementById('settingRoomTitle').value = document.getElementById('chat-user-name').textContent.replace(/\s*\(\d+명\)/, '');
    
    // 비공개방이면 초대코드 표시
    const inviteCodeSection = document.getElementById('inviteCodeSection');
    
    if (currentGroupIsPrivate == 1 && currentGroupInviteCode) {
        document.getElementById('settingInviteCode').value = currentGroupInviteCode;
        inviteCodeSection.style.display = 'block';
    } else {
        inviteCodeSection.style.display = 'none';
    }
    
    // 멤버 목록 로드 (추방 버튼 포함)
    loadSettingMemberList();

    document.getElementById('groupSettingOverlay').classList.add('active');
    document.getElementById('groupSettingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

//초대코드 복사
function copyInviteCode() {
    const code = document.getElementById('settingInviteCode').value;
    navigator.clipboard.writeText(code).then(() => {
        alert('초대코드가 복사됐습니다: ' + code);
    });
}

// 설정 모달 닫기
function closeGroupSettingModal() {
    document.getElementById('groupSettingOverlay').classList.remove('active');
    document.getElementById('groupSettingModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 이미지 미리보기
function previewGroupRoomImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('groupRoomImagePreview');
        preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);
}

// 설정 모달 멤버 목록 (추방 버튼 포함)
function loadSettingMemberList() {
    fetch('/groupchat/members?roomId=' + currentGroupRoomId)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderSettingMemberList(data.members);
        }
    });
}

function renderSettingMemberList(members) {
    const container = document.getElementById('settingMemberList');
    if (!container) return;

    container.innerHTML = '';
    members.forEach(member => {
        const isOwner = member.memberRole === 'OWNER';
        container.insertAdjacentHTML('beforeend', `
            <div class="member-item">
        		${renderAvatar(member, 40)}
                <div class="member-info">
                    <div class="member-name">
                        ${member.nickname || '사용자'}
                        ${isOwner ? '<span class="member-role-badge">방장</span>' : ''}
                    </div>
                </div>
                ${!isOwner ? `
                <button class="btn btn-outline" style="width: auto; padding: 4px 10px; font-size: 12px; color: #E53E3E; border-color: #E53E3E;" 
                        onclick="kickMember(${member.accountId}, '${member.nickname}')">
                		추방
                </button>` : ''}
            </div>
        `);
    });
}

// 채팅방 설정 저장
function saveGroupSetting() {
    const title = document.getElementById('settingRoomTitle').value.trim();
    const description = document.getElementById('settingRoomDescription').value.trim();
    const imageFile = document.getElementById('groupRoomImageInput').files[0];

    if (!title) {
        alert('방 제목을 입력해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('roomId', currentGroupRoomId);
    formData.append('roomTitle', title);
    formData.append('description', description);
    if (imageFile) {
        formData.append('roomImage', imageFile);
    }

    fetch('/groupchat/update', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeGroupSettingModal();
            // 헤더 제목 업데이트
            updateGroupChatHeader(title, null);
            // 목록 다시 로드
            loadGroupRooms();
            alert('설정이 저장됐습니다.');
        } else {
            alert('저장 실패: ' + (data.error || '알 수 없는 오류'));
        }
    })
    .catch(error => console.error('Error:', error));
}

// 멤버 추방
function kickMember(accountId, nickname) {
    if (!confirm(`${nickname}님을 추방하시겠습니까?`)) return;

    fetch('/groupchat/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `roomId=${currentGroupRoomId}&accountId=${accountId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadSettingMemberList();
            loadGroupMembers(currentGroupRoomId);
            alert(`${nickname}님을 추방했습니다.`);
        } else {
            alert('추방 실패: ' + (data.error || '알 수 없는 오류'));
        }
    })
    .catch(error => console.error('Error:', error));
}


// ================================
// 3. 그룹방 생성
// ================================

function createGroupChat(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }

    const title = document.getElementById('groupTitle').value.trim();
    const description = document.getElementById('groupDescription').value.trim();
    const maxMembers = document.getElementById('groupMaxMembers').value;
    const visibility = document.querySelector('input[name="visibility"]:checked').value;
    const isPrivate = visibility === 'private' ? 1 : 0;
    
    // 비공개면 랜덤 초대코드 생성
    let inviteCode = null;
    if (isPrivate) {
        inviteCode = generateInviteCode();
    }
    
    if (!title) {
        alert('방 제목을 입력해주세요.');
        return;
    }

    fetch('/groupchat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `roomTitle=${encodeURIComponent(title)}
    			&description=${encodeURIComponent(description)}
    			&maxMembers=${encodeURIComponent(maxMembers)}
        		&isPrivate=${isPrivate}
        		&inviteCode=${inviteCode ? encodeURIComponent(inviteCode) : ''}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeNewGroupChatModal();
            
            // 목록 다시 로드
            loadGroupRooms();
            //addGroupRoomToList(data.roomId, title, 1);
            
            // 비공개면 초대코드 안내 (임시)
            if (isPrivate) {
                alert(`방이 생성됐습니다!\n초대코드: ${inviteCode}\n멤버에게 공유해주세요.`);
            }
            
        } else {
            alert('그룹 채팅방 생성 실패: ' + (data.error || '알 수 없는 오류'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('그룹 채팅방 생성 실패');
    });
}

//랜덤 초대코드 생성 (6자리 영숫자)
function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// 초대코드 재발급
function reissueInviteCode() {
    if (!confirm('초대코드를 재발급하면 기존 코드는 사용할 수 없습니다. 재발급하시겠습니까?')) return;

    fetch('/groupchat/reissue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `roomId=${currentGroupRoomId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentGroupInviteCode = data.inviteCode;
            document.getElementById('settingInviteCode').value = data.inviteCode;
            alert('초대코드가 재발급됐습니다: ' + data.inviteCode);
        } else {
            alert('재발급 실패: ' + (data.error || '알 수 없는 오류'));
        }
    })
    .catch(error => console.error('Error:', error));
}

// ================================
// 4. 그룹방 목록
// ================================

function loadGroupRooms() {
    fetch('/groupchat/rooms')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderGroupRooms(data.rooms);
        }
    })
    .catch(error => console.error('Error:', error));
}

function renderGroupRooms(rooms) {
    const container = document.getElementById('opentalk-container');
    if (!container) return;

    container.innerHTML = '';

    if (!rooms || rooms.length === 0) {
        container.innerHTML = `
            <div class="chat-empty" style="padding: 40px 20px; text-align: center;">
                <p style="color: #65676B; font-size: 14px;">참여 중인 그룹 채팅이 없습니다</p>
            </div>`;
        return;
    }

    rooms.forEach(room => {
    	addGroupRoomToList(room.roomId, room.roomTitle, room.memberCount, room.lastMessage, room.description, room.roomImage, room.isFavorite, room.isMuted);
    });
}
function addGroupRoomToList(roomId, title, memberCount, lastMessage, description, roomImage, isFavorite, isMuted) {
    const container = document.getElementById('opentalk-container');
    if (!container) return;
    if (container.querySelector(`[data-room-id="${roomId}"]`)) return;

    const favoriteClass = isFavorite === 'Y' ? 'favorited' : '';
    const mutedClass = isMuted === 1 ? 'muted' : ''; 
    
    const iconHtml = roomImage
        ? `<img src="${roomImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
        : `<span style="font-size: 14px; font-weight: 600; color: #606770;">${title.substring(0, 1)}</span>`;

    const html = `
    	<div class="opentalk-room ${favoriteClass} ${mutedClass}" data-room-id="${roomId}" onclick="openGroupChat(${roomId})">
            <div class="opentalk-header">
                <div class="opentalk-icon">
                    ${iconHtml}
                </div>
                <div class="opentalk-info">
                    <div class="opentalk-title">${title}</div>
                    <div class="opentalk-members">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path>
                        </svg>
                        <span>${memberCount || 1}명</span>
                    </div>
                </div>
            </div>
           	<p class="opentalk-description">${description || ''}</p>
            <!--<p class="opentalk-last-message">${lastMessage || '대화를 시작하세요'}</p>-->
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

// ================================
// 5. 그룹방 열기
// ================================

function openGroupChat(roomId) {
    disconnectGroupWebSocket();
    
    // 멤버 사이드바 닫기
    document.getElementById('memberSidebar').classList.remove('active');

    fetch('/groupchat/room/' + roomId)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 채팅 영역 표시
            document.getElementById('chat-empty').classList.add('hidden');
            document.getElementById('chat-selected').classList.remove('hidden');
            
            // 그룹채팅 액션 버튼 표시
            document.getElementById('group-chat-actions').classList.remove('hidden');
            document.getElementById('chat-hati-badge').style.display = 'none'; // 그룹채팅엔 hati badge 불필요
            
            // 헤더 업데이트 (그룹방 제목 + 인원수)
            updateGroupChatHeader(data.roomTitle, data.memberCount, data.roomImage);

            // 메시지 히스토리 표시
            displayGroupChatHistory(data.history, data.myId);

            // 하이라이트
            highlightGroupRoom(roomId);

            // WebSocket 연결
            connectGroupWebSocket(roomId, data.myId);
            isInGroupChatRoom = true;
            
            // 채팅방 공개 여부 & 초대 코드 저장
            currentGroupIsPrivate = data.isPrivate;
            currentGroupInviteCode = data.inviteCode;
            currentGroupBjAccountId = data.bjAccountId;
            currentGroupMyId = data.myId;
            
            // 방장이면 설정 버튼 표시
            if (currentGroupMyId === currentGroupBjAccountId) {
                document.getElementById('group-setting-btn').classList.remove('hidden');
            } else {
                document.getElementById('group-setting-btn').classList.add('hidden');
            }
            
            
            
            // 읽음 처리
            if (data.history && data.history.length > 0) {
                const lastMsg = data.history[data.history.length - 1];
                markGroupAsRead(roomId, lastMsg.messageId);
            }
        } else {
            alert('채팅방을 불러오는데 실패했습니다.');
        }
    })
    .catch(error => console.error('Error:', error));
    
    
}

function updateGroupChatHeader(roomTitle, memberCount, roomImage) {
    const chatUserName = document.getElementById('chat-user-name');
    if (chatUserName) {
        chatUserName.textContent = memberCount ? `${roomTitle} (${memberCount}명)` : roomTitle;
    }
    const avatar = document.getElementById('chat-avatar');
    if (avatar) {
        if (roomImage) {
            avatar.innerHTML = `<img src="${roomImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            avatar.textContent = roomTitle.substring(0, 1);
        }
    }
}

function highlightGroupRoom(roomId) {
    const container = document.getElementById('opentalk-container');
    if (!container) return;
    container.querySelectorAll('.opentalk-room').forEach(item => item.classList.remove('active'));
    const current = container.querySelector(`[data-room-id="${roomId}"]`);
    if (current) current.classList.add('active');
}

// ================================
// 6. 메시지
// ================================

function sendGroupMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (!message || !currentGroupRoomId || !groupStompClient) {
        console.error('그룹 메시지 전송 조건 불만족');
        return;
    }

    const chatMessage = {
        roomId: currentGroupRoomId,
        senderAccountId: currentGroupMyId,
        content: message
    };

    groupStompClient.send('/app/groupchat/send', {}, JSON.stringify(chatMessage));
    messageInput.value = '';
    updateSendButton();
}

function displayGroupChatHistory(history, myId) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    if (!history || history.length === 0) {
        chatMessages.innerHTML = `
            <div class="chat-empty">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p>대화를 시작하세요</p>
            </div>`;
        return;
    }

    let messagesHtml = '';
    let currentGroup = null;

    history.forEach((msg, index) => {
        // 시스템 메시지
        if (msg.messageType === 'SYSTEM') {
            if (currentGroup) {
                messagesHtml += '</div></div>';
                currentGroup = null;
            }
            messagesHtml += `
                <div class="message-system">
                    <span>${msg.content}</span>
                </div>`;
            return;
        }

        const isMine = msg.senderAccountId === myId;
        const currentTime = formatMessageTime(msg.createdAt);

        const prevMsg = index > 0 ? history[index - 1] : null;
        const prevIsMine = prevMsg ? prevMsg.senderAccountId === myId : null;
        const prevSender = prevMsg ? prevMsg.senderAccountId : null;
        const prevTime = prevMsg ? formatMessageTime(prevMsg.createdAt) : null;

        // 같은 사람이 같은 분에 보낸 메시지면 연속 메시지
        const isContinuous = (prevSender === msg.senderAccountId) && (prevTime === currentTime);

        const isDeleted = msg.isDeleted === 'Y';
        const deletedClass = isDeleted ? 'deleted' : '';

        // 메시지 내용 생성
        let messageContent;
        if (isDeleted) {
            messageContent = '삭제된 메시지입니다.';
        } else if (msg.messageType === 'IMAGE') {
            messageContent = msg.mediaFiles.map(file =>
                `<img src="${file.url}" class="chat-image" onclick="window.open('${file.url}')" />`
            ).join('');
        } else if (msg.messageType === 'FILE') {
            messageContent = msg.mediaFiles.map(file => {
                const decodedUrl = decodeURIComponent(file.url);
                const fullFileName = decodedUrl.split('/').pop();
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
            messageContent = escapeHtml(msg.content);
        }

        // 읽음 수 계산 (전체 인원 - 읽은 사람 수)
        const unreadCount = msg.unreadCount > 0 ? `<span class="read-status">${msg.unreadCount}</span>` : '';
        const timeHtml = !isContinuous ? `<span class="message-time">${currentTime}</span>` : '';

        if (isMine) {
            if (currentGroup) {
                messagesHtml += '</div></div>';
                currentGroup = null;
            }
            const continuousClass = isContinuous ? 'message-continuous' : '';
            messagesHtml += `
                <div class="message-sent ${continuousClass}" data-minute="${currentTime}" data-message-id="${msg.messageId}" data-sender-id="${msg.senderAccountId}">
                    <div class="message-meta">
                        ${unreadCount}
                        ${timeHtml}
                    </div>
                    <div class="message-bubble ${deletedClass}">
                        <p>${messageContent}</p>
                    </div>
                </div>`;
        } else {
            if (!isContinuous) {
                if (currentGroup) {
                    messagesHtml += '</div></div>';
                }
                messagesHtml += `
                    <div class="message-group">
                    	${renderAvatar({profileImageUrl: msg.senderProfileImageUrl, hatiCode: msg.senderHatiCode, gender: msg.senderGender, nickname: msg.senderNickname}, 36)}
                        <div class="message-group-content">
                            <div class="message-group-header">${msg.senderNickname || '사용자'}</div>`;
                currentGroup = true;
            }
            messagesHtml += `
                <div class="message-group-message" data-minute="${currentTime}" data-message-id="${msg.messageId}" data-sender-id="${msg.senderAccountId}">
                    <div class="message-bubble ${deletedClass}">
                        <p>${messageContent}</p>
                    </div>
                    ${timeHtml}
                </div>`;
        }
    });

    if (currentGroup) {
        messagesHtml += '</div></div>';
    }

    chatMessages.innerHTML = messagesHtml;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayNewGroupMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const emptyMsg = chatMessages.querySelector('.chat-empty');
    if (emptyMsg) emptyMsg.remove();

    const isMine = message.senderAccountId === currentGroupMyId;
    const currentTime = formatMessageTime(message.createdAt);

    let messageContent;
    if (message.messageType === 'IMAGE') {
        messageContent = message.mediaFiles.map(file =>
            `<img src="${file.url}" class="chat-image" onclick="window.open('${file.url}')" />`
        ).join('');
    } else if (message.messageType === 'FILE') {
        messageContent = message.mediaFiles.map(file => {
            const decodedUrl = decodeURIComponent(file.url);
            const fullFileName = decodedUrl.split('/').pop();
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

    // 연속 메시지 판단
    const lastMessage = chatMessages.lastElementChild;
    let isContinuous = false;

    if (lastMessage) {
        const lastIsMine = lastMessage.classList.contains('message-sent');
        let lastTime = null;
        let lastSenderId = null;

        if (lastIsMine) {
            lastTime = lastMessage.getAttribute('data-minute');
            lastSenderId = parseInt(lastMessage.getAttribute('data-sender-id'));
        } else {
            const lastGroupMessage = lastMessage.querySelector('.message-group-message:last-child');
            if (lastGroupMessage) {
                lastTime = lastGroupMessage.getAttribute('data-minute');
                lastSenderId = parseInt(lastMessage.getAttribute('data-sender-id'));
            }
        }
        isContinuous = (lastSenderId === message.senderAccountId) && (lastTime === currentTime);
    }

    // 읽음 수 (새 메시지는 전체 인원 - 1 = 나 제외한 나머지)
    const unreadCount = message.unreadCount > 0 ? `<span class="read-status">${message.unreadCount}</span>` : '';
    const timeHtml = !isContinuous ? `<span class="message-time">${currentTime}</span>` : '';

    if (isMine) {
        const continuousClass = isContinuous ? 'message-continuous' : '';
        chatMessages.insertAdjacentHTML('beforeend', `
            <div class="message-sent ${continuousClass}" data-minute="${currentTime}" data-message-id="${message.messageId}" data-sender-id="${message.senderAccountId}">
                <div class="message-meta">
                    ${unreadCount}
                    ${timeHtml}
                </div>
                <div class="message-bubble">
                    <p>${messageContent}</p>
                </div>
            </div>`);
    } else {
        if (!isContinuous) {
            chatMessages.insertAdjacentHTML('beforeend', `
                <div class="message-group" data-sender-id="${message.senderAccountId}">
            		${renderAvatar({profileImageUrl: message.senderProfileImageUrl, hatiCode: message.senderHatiCode, gender: message.senderGender, nickname: message.senderNickname}, 36)}
                    <div class="message-group-content">
                        <div class="message-group-header">${message.senderNickname || '사용자'}</div>
                        <div class="message-group-message" data-minute="${currentTime}" data-message-id="${message.messageId}" data-sender-id="${message.senderAccountId}">
                            <div class="message-bubble">
                                <p>${messageContent}</p>
                            </div>
                            ${timeHtml}
                        </div>
                    </div>
                </div>`);
        } else {
            const lastGroup = chatMessages.querySelector('.message-group:last-child .message-group-content');
            if (lastGroup) {
                lastGroup.insertAdjacentHTML('beforeend', `
                    <div class="message-group-message" data-minute="${currentTime}" data-message-id="${message.messageId}" data-sender-id="${message.senderAccountId}">
                        <div class="message-bubble">
                            <p>${messageContent}</p>
                        </div>
                    </div>`);
            }
        }
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displaySystemMessage(content) {
	// SYSTEM 메시지는 displaySystemMessage()에서 처리하므로 여기서 걸러냄
    if (message.messageType === 'SYSTEM' || message.type === 'SYSTEM') return;
    
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    chatMessages.insertAdjacentHTML('beforeend', `
        <div class="message-system">
            <span>${content}</span>
        </div>`);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}



function reloadGroupChatMessages(roomId) {
	console.log(roomId);
    fetch(`/groupchat/messages?roomId=${roomId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayGroupChatHistory(data.history, currentGroupMyId);
        }
    })
    .catch(error => console.error('Error:', error));
}

// ================================
// 7. 읽음 처리
// ================================

function markGroupAsRead(roomId, messageId) {
    fetch('/groupchat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `roomId=${roomId}&messageId=${messageId}`
    });
}

// ================================
// 8. 공통 유틸 (chat.js와 공유)
// ================================

function buildMessageContent(msg, isDeleted) {
    if (isDeleted) return '삭제된 메시지입니다.';
    if (msg.messageType === 'IMAGE') {
        return msg.mediaFiles.map(file =>
            `<img src="${file.url}" class="chat-image" onclick="window.open('${file.url}')" />`
        ).join('');
    }
    if (msg.messageType === 'FILE') {
        return msg.mediaFiles.map(file => {
            const decodedUrl = decodeURIComponent(file.url);
            const fullFileName = decodedUrl.split('/').pop();
            const fileNameOnly = fullFileName.substring(fullFileName.indexOf('_') + 1);
            return `
                <div class="chat-file-wrapper">
                    <a href="${file.url}" download class="chat-file">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        ${fileNameOnly}
                    </a>
                </div>`;
        }).join('');
    }
    return escapeHtml(msg.content);
}

//멤버 사이드바 토글
function toggleMemberSidebar() {
    const sidebar = document.getElementById('memberSidebar');
    sidebar.classList.toggle('active');
    
    // 열릴 때 멤버 목록 로드
    if (sidebar.classList.contains('active')) {
        loadGroupMembers(currentGroupRoomId);
    }
}

// 멤버 목록 로드
function loadGroupMembers(roomId) {
    fetch('/groupchat/members?roomId=' + roomId)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderMemberList(data.members);
        }
    })
    .catch(error => console.error('Error:', error));
}

// 멤버 목록 렌더링
function renderMemberList(members) {
    const memberList = document.getElementById('memberList');
    if (!memberList) return;

    memberList.innerHTML = '';
    members.forEach(member => {
        const isOwner = member.memberRole === 'OWNER';
        memberList.insertAdjacentHTML('beforeend', `
            <div class="member-item">
        		${renderAvatar(member, 40)}
                <div class="member-info">
                    <div class="member-name">
                        ${member.nickname || '사용자'}
                        ${isOwner ? '<span class="member-role-badge">방장</span>' : ''}
                    </div>
                </div>
            </div>
        `);
    });
}

//그룹채팅 목록 우클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const opentalkContainer = document.getElementById('opentalk-container');

    if (opentalkContainer) {
        opentalkContainer.addEventListener('contextmenu', function(e) {
            const roomItem = e.target.closest('.opentalk-room');
            if (roomItem) {
                e.preventDefault();
                groupContextMenuRoomId = parseInt(roomItem.dataset.roomId);
                groupContextMenuElement = roomItem;
                showGroupContextMenu(e.pageX, e.pageY, roomItem);
            }
        });
    }

    // 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        const contextMenu = document.getElementById('groupChatContextMenu');
        if (contextMenu && !contextMenu.contains(e.target)) {
            hideGroupContextMenu();
        }
    });
});

// 그룹 컨텍스트 메뉴 표시
function showGroupContextMenu(x, y, roomItem) {
    const contextMenu = document.getElementById('groupChatContextMenu');
    if (!contextMenu) return;

    const isFavorited = roomItem.classList.contains('favorited');
    const isMuted = roomItem.classList.contains('muted');

    document.getElementById('groupFavoriteText').textContent = isFavorited ? '상단 고정 해제' : '상단 고정';
    document.getElementById('groupMuteText').textContent = isMuted ? '알림 켜기' : '알림 끄기';

    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.add('active');

    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (y - rect.height) + 'px';
    }
}

// 그룹 컨텍스트 메뉴 숨기기
function hideGroupContextMenu() {
    const contextMenu = document.getElementById('groupChatContextMenu');
    if (contextMenu) contextMenu.classList.remove('active');
    groupContextMenuRoomId = null;
    groupContextMenuElement = null;
}

// 상단 고정 토글
function toggleGroupFavorite() {
    if (!groupContextMenuRoomId) return;

    fetch('/groupchat/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `roomId=${groupContextMenuRoomId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && groupContextMenuElement) {
            groupContextMenuElement.classList.toggle('favorited');

            const container = document.getElementById('opentalk-container');
            const allItems = Array.from(container.querySelectorAll('.opentalk-room'));
            allItems.sort((a, b) => {
                const aFav = a.classList.contains('favorited') ? 0 : 1;
                const bFav = b.classList.contains('favorited') ? 0 : 1;
                return aFav - bFav;
            });
            allItems.forEach(item => container.appendChild(item));
        }
        hideGroupContextMenu();
    })
    .catch(error => console.error('Error:', error));
}

// 알림 토글
function toggleGroupMute() {
    if (!groupContextMenuRoomId) return;

    fetch('/groupchat/mute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `roomId=${groupContextMenuRoomId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && groupContextMenuElement) {
            if (data.isMuted) {
                groupContextMenuElement.classList.add('muted');
            } else {
                groupContextMenuElement.classList.remove('muted');
            }
        }
        hideGroupContextMenu();
    })
    .catch(error => console.error('Error:', error));
}

// 나가기
function leaveGroupChatRoomFromMenu() {
    if (!groupContextMenuRoomId) return;

    if (!confirm('채팅방에서 나가시겠습니까?')) {
        hideGroupContextMenu();
        return;
    }
    
    // roomId 저장
    const roomId = groupContextMenuRoomId;
    
    // 방장인지 확인
    const isOwner = (currentGroupRoomId === roomId) && 
                    (currentGroupMyId === currentGroupBjAccountId);
    
    
    if (isOwner) {
        // 방장이면 위임 먼저
        hideGroupContextMenu();
        openTransferOwnerModal(roomId);
    } else {
        // 일반 멤버면 바로 나가기
        executeLeaveGroupRoom(roomId);
    }
}

function openTransferOwnerModal(roomId) {
    // 멤버 목록 로드 (본인 제외)
    fetch('/groupchat/members?roomId=' + roomId)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const members = data.members.filter(m => m.accountId !== currentGroupMyId);

            if (members.length === 0) {
                // 혼자면 바로 나가기
                executeLeaveGroupRoom(roomId);
                return;
            }

            // 위임할 멤버 목록 렌더링
            const container = document.getElementById('transferMemberList');
            container.innerHTML = '';
            members.forEach(member => {
                container.insertAdjacentHTML('beforeend', `
                    <div class="member-item">
                		${renderAvatar(member, 40)}
                        <div class="member-info">
                            <div class="member-name">${member.nickname || '사용자'}</div>
                        </div>
                        <button class="btn btn-primary" style="width: auto; padding: 4px 10px; font-size: 12px;"
                                onclick="transferAndLeave(${member.accountId}, '${member.nickname}', ${roomId})">
                			위임
                        </button>
                    </div>
                `);
            });

            document.getElementById('transferOwnerOverlay').classList.add('active');
            document.getElementById('transferOwnerModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
}

function closeTransferOwnerModal() {
    document.getElementById('transferOwnerOverlay').classList.remove('active');
    document.getElementById('transferOwnerModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 위임 후 나가기
function transferAndLeave(newOwnerId, nickname, roomId) {
    if (!confirm(`${nickname}님에게 방장을 위임하고 나가시겠습니까?`)) return;

    fetch('/groupchat/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `roomId=${roomId}&newOwnerId=${newOwnerId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeTransferOwnerModal();
            executeLeaveGroupRoom(roomId);
        } else {
            alert('위임 실패: ' + (data.error || '알 수 없는 오류'));
        }
    });
}

// 실제 나가기 실행
function executeLeaveGroupRoom(roomId) {
    fetch('/groupchat/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `roomId=${roomId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const roomEl = document.querySelector(`#opentalk-container [data-room-id="${roomId}"]`);
            if (roomEl) roomEl.remove();

            if (currentGroupRoomId === roomId) {
                disconnectGroupWebSocket();
                document.getElementById('chat-empty').classList.remove('hidden');
                document.getElementById('chat-selected').classList.add('hidden');
                document.getElementById('group-chat-actions').classList.add('hidden');
            }
            alert('채팅방에서 나갔습니다.');
        } else {
            alert('나가기 실패: ' + (data.error || '알 수 없는 오류'));
        }
    });
}

//선택 모달 열기
function openGroupChatSelectModal() {
    // 참여 옵션 초기화
    document.getElementById('joinOptions').classList.add('hidden');
    document.getElementById('inviteCodeInputSection').classList.add('hidden');
    document.getElementById('joinInviteCode').value = '';

    document.getElementById('groupChatSelectOverlay').classList.add('active');
    document.getElementById('groupChatSelectModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 선택 모달 닫기
function closeGroupChatSelectModal() {
    document.getElementById('groupChatSelectOverlay').classList.remove('active');
    document.getElementById('groupChatSelectModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 참여 옵션 표시
function showJoinOptions() {
    document.getElementById('joinOptions').classList.remove('hidden');
}

// 공개방 탐색 페이지로 이동
function goToPublicRoomSearch() {
    closeGroupChatSelectModal();
    window.location.href = '/explore?type=opentalk';
}

// 초대코드 입력란 표시
function showInviteCodeInput() {
    document.getElementById('inviteCodeInputSection').classList.remove('hidden');
}

// 초대코드로 방 참여
function joinByInviteCode() {
    const inviteCode = document.getElementById('joinInviteCode').value.trim().toUpperCase();
    if (!inviteCode || inviteCode.length !== 6) {
        alert('초대코드 6자리를 입력해주세요.');
        return;
    }

    fetch('/groupchat/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `inviteCode=${inviteCode}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeGroupChatSelectModal();
            loadGroupRooms();
            alert('방에 참여했습니다!');
        } else {
            alert('참여 실패: ' + (data.error || '올바르지 않은 초대코드입니다.'));
        }
    })
    .catch(error => console.error('Error:', error));
}
