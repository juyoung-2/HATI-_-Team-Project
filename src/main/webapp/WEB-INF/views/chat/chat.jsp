<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>채팅 - Health Mate</title>
    <link rel="stylesheet" href="/resources/css/chat.css">
    <link rel="stylesheet" href="/resources/css/home.css">
</head>
<body>
    <div class="main-layout">
        <div class="main-left">
            <%@ include file="/WEB-INF/views/common/side-nav.jsp" %>
        </div>
        <div class="main-center" style="overflow: hidden;">
            <div class="chat-container">
		       	<!-- 채팅 목록 사이드바 -->
		        <div class="chat-sidebar">
		            <div class="chat-sidebar-header">
		                <div class="chat-header-title">
		                    <svg class="icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
		                    </svg>
		                    <h2>채팅</h2>
		                </div>
		
		                <!-- 1:1 / OpenTalk 탭 -->
		                <div class="tabs">
		                    <div class="tabs-list">
		                        <button class="tab-trigger active" onclick="switchTab('1:1')" id="tab-1-1">
		                            1:1 Chat
		                        </button>
		                        <button class="tab-trigger" onclick="switchTab('opentalk')" id="tab-opentalk">
		                            Group Chat
		                        </button>
		                    </div>
		                </div>
		
		                <!-- 검색 -->
		                <div class="search-container">
		                    <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
		                    </svg>
		                    <input type="text" class="input" placeholder="대화 검색" id="searchInput">
		                </div>
		            </div>
		
		            <!-- 1:1 Chat 목록 -->
					<div class="conversation-list" id="conversations-container">
		   			    <!-- 기존 채팅방 목록 표시 -->
					    <c:choose>
					        <c:when test="${not empty chatRooms}">
					            <c:forEach var="room" items="${chatRooms}">
					                <div class="conversation-item ${room.isFavorite == 'Y' ? 'favorited' : ''} ${room.isMuted == 1 ? 'muted' : ''}" 
									     data-room-id="${room.roomId}" 
									     data-account-id="${room.otherAccountId}" 
									     data-is-favorite="${room.isFavorite}"
									     data-is-muted="${room.isMuted}"
									     onclick="openExistingChat(${room.roomId}, ${room.otherAccountId})">
					                    <div class="conversation-content">
					                        <div class="avatar">
											    <c:choose>
											        <c:when test="${not empty room.otherProfileImageUrl}">
											            <img src="${room.otherProfileImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>
											        </c:when>
											        <c:when test="${not empty room.otherHatiCode}">
											            <img src="${ctx}/resources/img/DefaultProfile/${room.otherHatiCode}_${room.otherGender == 'F' ? 'W' : 'M'}.png"
											                 style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
											                 onerror="this.onerror=null;this.src='${ctx}/resources/img/DefaultProfile/default.png';"/>
											        </c:when>
											        <c:otherwise>${fn:substring(room.otherNickname, 0, 1)}</c:otherwise>
											    </c:choose>
											</div>
					                        <div class="conversation-info">
					                            <div class="conversation-header">
					                                <div class="conversation-title">
					                                    <span class="hati-badge hati-badge--${room.otherHatiCode}">${room.otherHatiCode}</span>
					                                    <span class="conversation-name">${room.otherNickname}</span>
					                                </div>
					                            </div>
					                            <p class="conversation-message">
					                                <c:choose>
					                                    <c:when test="${not empty room.lastMessage}">
					                                        ${room.lastMessage}
					                                    </c:when>
					                                    <c:otherwise>
					                                        	대화를 시작하세요
					                                    </c:otherwise>
					                                </c:choose>
					                            </p>
					                            <p class="conversation-time">
												    <c:choose>
												        <c:when test="${not empty room.lastMessageTime}">
												            <!-- 오늘 날짜 -->
												            <jsp:useBean id="now" class="java.util.Date" />
												            <fmt:formatDate var="todayStr" value="${now}" pattern="yyyy-MM-dd" />
												            
												            <!-- 어제 날짜 -->
												            <jsp:useBean id="yesterday" class="java.util.Date" />
												            <jsp:setProperty name="yesterday" property="time" value="${now.time - 86400000}" />
												            <fmt:formatDate var="yesterdayStr" value="${yesterday}" pattern="yyyy-MM-dd" />
												            
												            <!-- 메시지 날짜 -->
												            <fmt:formatDate var="msgDateStr" value="${room.lastMessageTime}" pattern="yyyy-MM-dd" />
												            
												            <!-- 비교 -->
												            <c:choose>
												                <c:when test="${todayStr == msgDateStr}">
												                    <!-- 오늘이면 시간만 -->
												                    <fmt:formatDate value="${room.lastMessageTime}" pattern="a h:mm" />
												                </c:when>
												                <c:when test="${yesterdayStr == msgDateStr}">
												                    <!-- 어제 -->
												                    	어제
												                </c:when>
												                <c:otherwise>
												                    <!-- 그 외 날짜 -->
												                    <fmt:formatDate value="${room.lastMessageTime}" pattern="M월 d일" />
												                </c:otherwise>
												            </c:choose>
												        </c:when>
												        <c:otherwise>
												            	새 대화
												        </c:otherwise>
												    </c:choose>
												</p>
					                        </div>
					                    </div>
					                </div>
					            </c:forEach>
					        </c:when>
					        <c:otherwise>
				    			<!--  채팅방이 없을 때 -->
				    			<div class="chat-empty" style="padding: 40px 20px; text-align: center;">
				        			<p style="color: #65676B; font-size: 14px;">아직 대화가 없습니다<br>New Chat을 눌러 대화를 시작하세요</p>
				    			</div>
				    		</c:otherwise>
						</c:choose>
					</div>
		            
		            <!-- OpenTalk 목록 -->
		            <div id="opentalk-container" class="conversation-list hidden">
		                <div class="opentalk-room" onclick="selectChat(101, 'opentalk')">
		                    
		                </div>
		            </div>
		
		            <!-- New Chat 버튼 -->
		            <div class="action-buttons" id="action-buttons-1-1">
		                <button class="btn btn-primary" onclick="openNewChatModal()">
		                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
		                    </svg>
		                    New chat
		                </button>
		            </div>
		        
		        <div class="action-buttons hidden" id="action-buttons-opentalk">
				    <button class="btn btn-primary" onclick="openGroupChatSelectModal()">
				        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				        </svg>
				        New group chat
				    </button>
				</div>
				</div>
		
		        <!-- 메인 채팅 영역 -->
		        <div class="chat-main">
		            <!-- 채팅이 선택되지 않은 상태 -->
		            <div id="chat-empty" class="chat-empty">
		                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
		                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
		                </svg>
		                <h3>메시지</h3>
		                <p>대화를 선택하거나<br>새로운 대화를 시작하세요</p>
		            </div>
		
		            <!-- 채팅이 선택된 상태 -->
					<div id="chat-selected" class="hidden">
					    <!-- 채팅 헤더 -->
					    <div class="chat-header">
					        <div class="chat-header-info">
					            <div class="avatar" id="chat-avatar"></div>
					            <div>
					                <div style="display: flex; align-items: center; gap: 8px;">
										<span class="hati-badge" id="chat-hati-badge"></span>
					                    <span class="chat-user-name" id="chat-user-name"></span>
					                </div>
					            </div>
					        </div>
					        <!-- 멤버 목록 버튼 (그룹채팅일 때만 표시) -->
					        <div id="group-chat-actions" class="hidden">
					            <button class="btn-icon" onclick="toggleMemberSidebar()" title="멤버 목록">
					                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path>
					                </svg>
					            </button>
					        </div>
					    </div>
					
					    <!-- 메시지 영역 + 멤버 사이드바 -->
					    <div style="display: flex; flex: 1; overflow: hidden;">
					        <div style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
					            <!-- 메시지 영역 -->
					            <div class="chat-messages" id="chat-messages">
					                <div class="chat-empty">
					                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
					                    </svg>
					                    <p>대화를 시작하세요</p>
					                </div>
					            </div>
					            <!-- 메시지 입력  -->
					            <div class="message-input-container">
					            	<!-- 이모티콘 피커 (입력창 위에 배치) -->
								    <div class="emoji-picker" id="emojiPicker">
								        <div class="emoji-picker-header">
								            <button class="emoji-category-btn active" data-category="faces" type="button">😊</button>
								            <button class="emoji-category-btn" data-category="animals" type="button">🐶</button>
								            <button class="emoji-category-btn" data-category="food" type="button">🍕</button>
								            <button class="emoji-category-btn" data-category="activities" type="button">⚽</button>
								            <button class="emoji-category-btn" data-category="travel" type="button">🚗</button>
								            <button class="emoji-category-btn" data-category="objects" type="button">💡</button>
								            <button class="emoji-category-btn" data-category="symbols" type="button">❤️</button>
								        </div>
								        <div class="emoji-picker-body" id="emojiPickerBody">
								            <!-- 이모지들이 여기 들어감 -->
								        </div>
								    </div>
								
								    <div class="message-input-wrapper">
								        <!-- 파일 첨부 버튼 -->
								        <button class="btn-icon" type="button" title="파일 첨부" onclick="openFileTypeModal()">
								            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
								            </svg>
								        </button>
								        
								        <!-- 숨겨진 파일 input들 -->
										<input type="file" id="imageInput" style="display: none;" multiple accept="image/*" onchange="handleFileSelect(event, 'image')">
										<input type="file" id="fileInput" style="display: none;" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" onchange="handleFileSelect(event, 'file')">
								
								        <!-- 이모지 버튼 (ID 추가!) -->
								        <button class="btn-icon" type="button" id="emojiBtn" onclick="toggleEmojiPicker()" title="이모지">
								            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								            </svg>
								        </button>
								
								        <!-- 메시지 입력 -->
								        <textarea id="messageInput" class="message-input" placeholder="메시지를 입력하세요..." 
								                  rows="1" onkeydown="handleKeyDown(event)" oninput="updateSendButton()"></textarea>
								
								        <!-- 전송 버튼 -->
								        <button id="sendBtn" class="send-btn" onclick="sendMessage()" disabled>
								            <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
								                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
								            </svg>
								        </button>
								    </div>
					            </div>
					        </div>
					
					        <!-- 멤버 사이드바 -->
					        <div class="member-sidebar" id="memberSidebar">
					            <div class="member-sidebar-header">
					            	<span>멤버</span>
								    <div style="display: flex; gap: 4px;">
								        <!-- 설정 버튼 (방장만) -->
								        <button class="btn-icon hidden" id="group-setting-btn" onclick="openGroupSettingModal()" title="채팅방 설정">
								            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
								                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
								            </svg>
								        </button>
								        <!-- 닫기 버튼 -->
								        <button class="btn-icon" onclick="toggleMemberSidebar()">
								            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
								            </svg>
								        </button>
								    </div>
					            </div>
					            <div class="member-list" id="memberList"></div>
					            
					            <!-- 채팅방 나가기 버튼 -->
					            <div style="padding: 12px; border-top: 1px solid #F0F2F5;">
							        <button class="btn btn-outline" style="color: #E53E3E; border-color: #E53E3E;" onclick="leaveGroupChatRoomFromMenu()">
							            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
							            </svg>
							            	채팅방 나가기
							        </button>
							    </div>
					        </div>
					    </div>
					</div>
		
		    <!-- New Chat 모달 -->
		    <div class="modal-overlay" id="newChatOverlay" onclick="closeNewChatModal()"></div>
		    <div class="modal-content" id="newChatModal">
		        <button class="modal-close" onclick="closeNewChatModal()">
		            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
		            </svg>
		        </button>
		        
		        <div class="modal-header">
		            <h2 class="modal-title">New message</h2>
		        </div>
		
		        <div class="modal-body">
		            <div class="search-container" style="margin-bottom: 16px;">
		                <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
		                </svg>
		                <input type="text" class="input" placeholder="검색" id="userSearchInput" oninput="filterUsers()">
		            </div>
		
					<!-- 유저 리스트 -->
		        	<div class="user-list" id="userList">
					    <%-- 기존의 김트레이너, 이민지 등 더미 div들을 싹 지우고 아래 c:forEach를 넣으세요 --%>
					    <c:forEach var="user" items="${followers}">
					        <div class="user-item" onclick="startChat(${user.accountId})">
					            <div class="user-avatar">
								    <c:choose>
								        <c:when test="${not empty user.profile.profileImageUrl}">
								            <img src="${user.profile.profileImageUrl}" 
								                 style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
								        </c:when>
								        <c:when test="${not empty user.profile.hatiCode}">
								            <img src="${ctx}/resources/img/DefaultProfile/${user.profile.hatiCode}_${user.profile.gender == 'F' ? 'W' : 'M'}.png"
								                 style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
								                 onerror="this.onerror=null;this.src='${ctx}/resources/img/DefaultProfile/default.png';">
								        </c:when>
								        <c:otherwise>
								            <c:out value="${fn:substring(user.profile.nickname, 0, 1)}" default="?" />
								        </c:otherwise>
								    </c:choose>
								</div>
					            <div class="user-info">
					                <div class="user-name-wrapper">
					                    <span class="hati-badge hati-badge--${user.profile.hatiCode}">${user.profile.hatiCode}</span>
					                    <span class="user-name">${user.profile.nickname}</span>
					                </div>
					                <p class="user-username">${user.profile.handle}</p>
					            </div>
					        </div>
					    </c:forEach>
					</div>
		        </div>
		    </div>
			
			<!-- 그룹채팅 진입 선택 모달 -->
			<div class="modal-overlay" id="groupChatSelectOverlay" onclick="closeGroupChatSelectModal()"></div>
			<div class="modal-content" id="groupChatSelectModal">
			    <button class="modal-close" onclick="closeGroupChatSelectModal()">
			        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			        </svg>
			    </button>
			    <div class="modal-header">
			        <h2 class="modal-title">그룹 채팅</h2>
			    </div>
			    <div class="modal-body">
			        <div style="display: flex; flex-direction: column; gap: 12px;">
			            <button class="btn btn-primary" onclick="closeGroupChatSelectModal(); openNewGroupChatModal();">
			               	 	방 만들기
			            </button>
			            <button class="btn btn-outline" onclick="showJoinOptions()">
			                	방 참여하기
			            </button>
			            <!-- 참여 옵션 (처음엔 숨김) -->
			            <div id="joinOptions" class="hidden" style="display: flex; flex-direction: column; gap: 12px;">
			                <button class="btn btn-outline" onclick="goToPublicRoomSearch()">
			                   	 공개방 참여
			                </button>
			                <button class="btn btn-outline" onclick="showInviteCodeInput()">
			                   	 비공개방 참여
			                </button>
			                <!-- 초대코드 입력란 (처음엔 숨김) -->
			                <div id="inviteCodeInputSection" class="hidden">
			                    <div style="display: flex; gap: 8px; margin-top: 4px;">
			                        <input type="text" class="input" id="joinInviteCode" placeholder="초대코드 6자리 입력" maxlength="6" style="padding-left: 12px; text-transform: uppercase;">
			                        <button class="btn btn-primary" style="width: auto; min-width: 52px; flex-shrink: 0;" onclick="joinByInviteCode()"> 참여 </button>
			                    </div>
			                </div>
			            </div>
			        </div>
			    </div>
			</div>
			
		    <!-- New Group Chat 모달 -->
		    <div class="modal-overlay" id="newGroupChatOverlay" onclick="closeNewGroupChatModal()"></div>
		    <div class="modal-content" id="newGroupChatModal">
		        <button class="modal-close" onclick="closeNewGroupChatModal()">
		            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
		            </svg>
		        </button>
		        
		        <div class="modal-header">
		            <h2 class="modal-title">그룹 채팅방 만들기</h2>
		        </div>
		
		        <div class="modal-body">
		            <form id="groupChatForm" onsubmit="createGroupChat(event)">
		                
		                <div class="form-group">
		                    <label class="label" for="groupTitle">방 제목 *</label>
		                    <input type="text" class="input" id="groupTitle" placeholder="그룹 채팅방 이름을 입력하세요" required>
		                </div>
		
		                <div class="form-group">
		                    <label class="label" for="groupDescription">방 소개글</label>
		                    <textarea class="textarea" id="groupDescription" placeholder="그룹에 대한 간단한 설명을 입력하세요" rows="3"></textarea>
		                </div>
		
		                <div class="form-group">
		                    <label class="label" for="groupMaxMembers">총 인원</label>
		                    <input type="number" class="input" id="groupMaxMembers" placeholder="50" value="50" min="2" max="500">
		                </div>
		
		                <div class="form-group">
		                    <label class="label">공개 설정</label>
		                    <div class="radio-group">
		                        <div class="radio-item">
		                            <input type="radio" class="radio-input" id="visibility-public" name="visibility" value="public" checked>
		                            <label class="radio-label" for="visibility-public">공개 (누구나 검색하고 참여 가능)</label>
		                        </div>
		                        <div class="radio-item">
		                            <input type="radio" class="radio-input" id="visibility-private" name="visibility" value="private">
		                            <label class="radio-label" for="visibility-private">비공개 (초대를 통해서만 참여 가능)</label>
		                        </div>
		                    </div>
		                </div>
		            </form>
		        </div>
		
		        <div class="modal-footer">
		            <button type="button" class="btn btn-outline" onclick="closeNewGroupChatModal()">취소</button>
		            <button type="button" class="btn btn-primary" onclick="createGroupChat(event)">만들기</button>
		        </div>
		    </div>
		    
		    <!-- 컨텍스트 메뉴 -->
			<div class="context-menu" id="chatContextMenu">
			    <div class="context-menu-item" onclick="toggleFavorite()">
			        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
			        </svg>
			        <span id="favoriteText">상단 고정</span>
			    </div>
			    
			    <div class="context-menu-item" onclick="toggleMute()">
			        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
			        </svg>
			        <span id="muteText">알림 끄기</span>
			    </div>
			    
			    <div class="context-menu-divider"></div>
			    
			    <div class="context-menu-item danger" onclick="leaveChatRoomFromMenu()">
			        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
			        </svg>
			        <span>나가기</span>
			    </div>
			</div>
			
			<!-- 그룹채팅 컨텍스트 메뉴 -->
			<div class="context-menu" id="groupChatContextMenu">
			    <div class="context-menu-item" onclick="toggleGroupFavorite()">
			        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
			        </svg>
			        <span id="groupFavoriteText">상단 고정</span>
			    </div>
			
			    <div class="context-menu-item" onclick="toggleGroupMute()">
			        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
			        </svg>
			        <span id="groupMuteText">알림 끄기</span>
			    </div>
			
			    <div class="context-menu-divider"></div>
			
			    <div class="context-menu-item danger" onclick="leaveGroupChatRoomFromMenu()">
			        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
			        </svg>
			        <span>나가기</span>
			    </div>
			</div>
			
			<!-- 메시지 컨텍스트 메뉴 -->
			<div class="message-context-menu" id="messageContextMenu">
			    <div class="message-context-menu-item" onclick="copyMessage()">
			        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
			        </svg>
			        <span>복사</span>
			    </div>
			    
			    <div class="message-context-menu-divider"></div>
			    
			    <div class="message-context-menu-item" onclick="reportMessage()">
			        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
			        </svg>
			        <span>신고</span>
			    </div>
			    
			    <div class="message-context-menu-divider"></div>
			    
			    <div class="message-context-menu-item danger" onclick="deleteMessage()">
			        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
			        </svg>
			        <span>삭제</span>
			    </div>
			</div>
			
			<!-- 파일 타입 선택 모달 -->
			<div class="modal-overlay" id="fileTypeOverlay" onclick="closeFileTypeModal()"></div>
			<div class="file-type-modal" id="fileTypeModal">
			    <h3>전송할 파일 타입을 선택하세요</h3>
			    <div class="file-type-buttons">
			        <button class="file-type-btn" onclick="selectFileType('image')">
			            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
			            </svg>
			            <span>이미지</span>
			        </button>
			        
			        <button class="file-type-btn" onclick="selectFileType('file')">
			            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
			            </svg>
			            <span>파일</span>
			        </button>
			    </div>
			</div>
			
			<!-- 그룹채팅 설정 모달 -->
			<div class="modal-overlay" id="groupSettingOverlay" onclick="closeGroupSettingModal()"></div>
			<div class="modal-content" id="groupSettingModal">
			    <button class="modal-close" onclick="closeGroupSettingModal()">
			        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			        </svg>
			    </button>
			
			    <div class="modal-header">
			        <h2 class="modal-title">채팅방 설정</h2>
			    </div>
			
			    <div class="modal-body">
			        <!-- 채팅방 이미지 -->
			        <div class="form-group" style="text-align: center;">
			            <div id="groupRoomImagePreview" style="width: 80px; height: 80px; border-radius: 50%; background-color: #E7F3FF; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; cursor: pointer; overflow: hidden;" onclick="document.getElementById('groupRoomImageInput').click()">
			                <svg width="32" height="32" fill="none" stroke="#1877F2" viewBox="0 0 24 24">
			                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
			                </svg>
			            </div>
			            <input type="file" id="groupRoomImageInput" style="display: none;" accept="image/*" onchange="previewGroupRoomImage(event)">
			            <p style="font-size: 12px; color: #65676B;">클릭하여 이미지 변경</p>
			        </div>
			        
			        
			
			        <!-- 채팅방 제목 -->
			        <div class="form-group">
			            <label class="label" for="settingRoomTitle">방 제목</label>
			            <input type="text" class="input" id="settingRoomTitle" placeholder="채팅방 제목" style="padding-left: 12px;">
			        </div>
			
			        <!-- 채팅방 설명 -->
			        <div class="form-group">
			            <label class="label" for="settingRoomDescription">방 소개글</label>
			            <textarea class="textarea" id="settingRoomDescription" rows="3" placeholder="채팅방 설명"></textarea>
			        </div>
			        
			        <!-- 초대코드 -->
			      	<div class="form-group" id="inviteCodeSection" style="display:none;">
					    <label class="label">초대코드</label>
					    <div style="display: flex; align-items: center; gap: 8px;">
					        <input type="text" class="input" id="settingInviteCode" readonly style="flex: 1; padding-left: 12px; cursor: default;">
					        <button type="button" class="btn btn-outline" style="width: auto;" onclick="copyInviteCode()">복사</button>
					        <button type="button" class="btn btn-outline" style="width: auto;" onclick="reissueInviteCode()">재발급</button>
					    </div>
					</div>
			
			        <!-- 멤버 추방 -->
			        <div class="form-group">
			            <label class="label">멤버 관리</label>
			            <div id="settingMemberList"></div>
			        </div>
			    </div>
			
			    <div class="modal-footer">
			        <button type="button" class="btn btn-outline" onclick="closeGroupSettingModal()">취소</button>
			        <button type="button" class="btn btn-primary" onclick="saveGroupSetting()">저장</button>
			    </div>
			</div>
			
			<!-- 방장 위임 모달 -->
			<div class="modal-overlay" id="transferOwnerOverlay"></div>
			<div class="modal-content" id="transferOwnerModal">
			    <div class="modal-header">
			        <h2 class="modal-title">방장 위임</h2>
			    </div>
			    <div class="modal-body">
			        <p style="font-size: 14px; color: #65676B; margin-bottom: 16px;">
			            나가기 전에 새로운 방장을 선택해주세요.
			        </p>
			        <div id="transferMemberList"></div>
			    </div>
			    <div class="modal-footer">
			        <button type="button" class="btn btn-outline" onclick="closeTransferOwnerModal()">취소</button>
			    </div>
			</div>
		
		    <!-- WebSocket & STOMP 라이브러리 -->
			<script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
			<script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>
			<script type="text/javascript" src="/resources/js/groupChat.js"></script>
			<script type="text/javascript" src="/resources/js/chat.js"></script>
			<script src="/resources/js/side-nav-popover.js"></script>
			</div><!-- chat-container -->
        </div><!-- main-center -->
    </div><!-- main-layout -->

	<script>
		// side-nav의 Chat 메뉴 활성화  
	    document.addEventListener('DOMContentLoaded', function() {
	        var chatLink = document.querySelector('.side-item[href*="/chat"]');
	        if (chatLink) chatLink.classList.add('is-active');
	    });
	</script>
	
		<!-- 채팅 메시지 신고 모달 -->
		<div id="chatReportModal" class="report-modal-overlay" style="display:none;" onclick="closeChatReportModal()">
		    <div class="report-modal" onclick="event.stopPropagation()">
		        <div class="report-modal-header">
		            <h2 class="report-modal-title">신고하기</h2>
		            <button class="report-modal-close" onclick="closeChatReportModal()">×</button>
		        </div>
		        <div class="report-modal-body">
		            <div class="report-info-table">
		                <div class="report-info-row">
		                    <span class="report-info-label">신고 대상</span>
		                    <span class="report-info-value">채팅 메시지</span>
		                </div>
		            </div>
		            <textarea id="chatReportContent" class="report-textarea"
		                      placeholder="필요한 경우 신고 사유를 입력해주세요." maxlength="255"></textarea>
		        </div>
		        <div class="report-modal-footer">
		            <button class="report-btn-cancel" onclick="closeChatReportModal()">취소</button>
		            <button class="report-btn-submit" onclick="submitChatReport()">신고</button>
		        </div>
		    </div>
		</div>

</body>
</html>

