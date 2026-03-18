package org.hati.chat.controller;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 서버에 접속할 주소: http://localhost:8080/ws
        registry.addEndpoint("/ws")
        		.setAllowedOrigins("*")
        		.withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 구독 주소 접두사 (받기)
        registry.enableSimpleBroker("/queue", "/topic");
        // 발행 주소 접두사 (보내기)
        registry.setApplicationDestinationPrefixes("/app");
    }
}