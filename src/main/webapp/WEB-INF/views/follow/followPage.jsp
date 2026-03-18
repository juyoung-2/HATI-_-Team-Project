<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div class="page-wrapper">
  <div class="container">
    <div class="card">

      <!-- 헤더 -->
      <div class="card-header">
        <div class="header-inner">
          <svg class="icon-users" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               viewBox="0 0 24 24" fill="none" stroke="#1877F2" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h2 class="card-title">팔로우 관리</h2>
        </div>
      </div>

      <!-- 탭 -->
      <div class="tabs">
        <div class="tabs-list">
          <button class="tab-trigger active" data-tab="following">팔로잉</button>
          <button class="tab-trigger" data-tab="followers">팔로워</button>
          <button class="tab-trigger" data-tab="suggestions">추천</button>
        </div>

        <!-- 팔로잉 탭 -->
        <div class="tab-content active" id="tab-following">
          <div class="list" id="list-following"></div>
        </div>

        <!-- 팔로워 탭 -->
        <div class="tab-content" id="tab-followers">
          <div class="list" id="list-followers"></div>
        </div>

        <!-- 추천 탭 -->
        <div class="tab-content" id="tab-suggestions">
          <div class="list" id="list-suggestions"></div>
        </div>
      </div>

    </div>
  </div>
</div>

<script src="/resources/js/followPage.js"></script>
