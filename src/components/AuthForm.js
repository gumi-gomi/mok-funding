/* 
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 

  const handleAuth = async () => {
    try {
      if (isLogin) {
      
        await signInWithEmailAndPassword(auth, email, password);
        alert('로그인 성공!');
      } else {
       
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

     
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name, 
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
 */



// --------------------------------------------- 1번 끝

/* import React, { useState } from 'react';
import styled from 'styled-components';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert('로그인 성공!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name,
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
    <Wrapper>
      <ProgramBox>
        <Title>NEXT: 창업 인재 성장 프로젝트</Title>
        <LogoContainer>
          <Logo>참여 기관 로고</Logo>
          <Logo>참여 기관 로고</Logo>
          <Logo>참여 기관 로고</Logo>
        </LogoContainer>

      </ProgramBox>

      <LoginBox>
        {!isLogin && (
          <Input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <LoginButton onClick={handleAuth}>
          {isLogin ? '로그인' : '회원가입'}
        </LoginButton>

        <ToggleText onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? '회원가입 하기' : '로그인으로 돌아가기'}
        </ToggleText>
      </LoginBox>
    </Wrapper>
  );
};

export default AuthForm;


const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
`;

const ProgramBox = styled.div`
  background-color: rgba(0,0,0,0.1);
  padding: 20px;
  padding-bottom: 40px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 30px;
  width: 90%;
  max-width: 600px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 30px;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  border: 1px solid #ccc;

  background-color: white;
  line-height: 80px;
  text-align: center;
  font-size: 12px;
`;

const LogoNote = styled.p`
  margin-top: 10px;
  font-size: 12px;
  color: #666;
`;

const LoginBox = styled.div`
  background-color: #d2f0ff;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
`;

const LoginButton = styled.button`
  padding: 12px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
`;

const ToggleText = styled.p`
  margin-top: 12px;
  text-align: center;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
`;  */

// ------------------------------- 2번
import React, { useState } from 'react';
import styled from 'styled-components';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [nameInput, setNameInput] = useState(''); // 실제 이름 (이메일처럼 처리)
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('');

  const handleAuth = async () => {
    const email = `${nameInput}@naver.com`; // 이름을 이메일처럼 가공
    const password = phone;

    if (!nameInput.trim() || !phone.trim() || (!isLogin && !team.trim())) {
  alert('모든 필드를 입력해주세요.');
  return;
}

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert('로그인 성공!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          name: nameInput,
          phone: phone,
          team: team,
          balance: 1000000,
          createdAt: new Date()
        });

        alert('회원가입 성공!');
        setIsLogin(true); // 로그인 화면으로 전환
      }
    } catch (error) {
      console.error('인증 에러:', error);
      alert(`오류: ${error.message}`);
    }
  };

  return (
    <Wrapper>
      <ProgramBox>
        <Title>NEXT: 창업 인재 성장 프로젝트</Title>
        <LogoContainer>
          <Logo>참여 기관 로고</Logo>
          <Logo>참여 기관 로고</Logo>
          <Logo>참여 기관 로고</Logo>
        </LogoContainer>
      </ProgramBox>

      <LoginBox>
        <Input
          type="text"
          placeholder="이름"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <Input
          type="tel"
          placeholder="전화번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {!isLogin && (
          <Input
            type="text"
            placeholder="팀명"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          />
        )}

        <LoginButton onClick={handleAuth}>
          {isLogin ? '로그인' : '회원가입'}
        </LoginButton>

        <ToggleText onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? '회원가입 하기' : '로그인으로 돌아가기'}
        </ToggleText>
      </LoginBox>
    </Wrapper>
  );
};

export default AuthForm;

// styled-components
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
`;

const ProgramBox = styled.div`
  background-color: rgba(0,0,0,0.1);
  padding: 20px 20px 40px 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 30px;
  width: 90%;
  max-width: 600px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 26px;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  border: 1px solid #ccc;
  background-color: white;
  line-height: 80px;
  text-align: center;
  font-size: 12px;
`;

const LoginBox = styled.div`
  background-color: #d2f0ff;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
`;

const LoginButton = styled.button`
  padding: 12px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
`;

const ToggleText = styled.p`
  margin-top: 12px;
  text-align: center;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
`;
