// src/components/AuthForm.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // 이름 입력 추가

  const handleAuth = async () => {
    try {
      if (isLogin) {
        // 로그인
        await signInWithEmailAndPassword(auth, email, password);
        alert('로그인 성공!');
      } else {
        // 회원가입
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore에 사용자 정보 저장
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name, // 이름 저장
          balance: 1000000,
          createdAt: new Date(),
        });

        alert('회원가입 성공!');
      }
    } catch (error) {
      console.error('인증 에러:', error);
      alert(`오류: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>{isLogin ? '로그인' : '회원가입'}</h2>

      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {!isLogin && (
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <button onClick={handleAuth}>
        {isLogin ? '로그인' : '회원가입'}
      </button>

      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer' }}>
        {isLogin ? '회원가입 하기' : '로그인으로 돌아가기'}
      </p>
    </div>
  );
};

export default AuthForm;
