package org.hati.user.service;

import org.hati.user.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public boolean isPrivateAccount(Long accountId) {
        Integer isPrivate = userMapper.selectIsPrivateByAccountId(accountId);
        return isPrivate != null && isPrivate == 1;
    }
}
