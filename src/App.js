// src/App.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import AuthForm from './components/AuthForm';
import Home from './pages/Home';
import MyPage from './pages/MyPage'; // ✅ 마이페이지 import

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false); // ✅ 마이페이지 상태 추가

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('로그아웃 되었습니다.');
      setShowMyPage(false); // 로그아웃 시 마이페이지 상태 초기화
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 실패');
    }
  };

  return (
    <div className="App">
      <h1>모의 펀딩 사이트</h1>

      {loggedIn && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <button onClick={handleLogout}>로그아웃</button>
          <button onClick={() => setShowMyPage((prev) => !prev)}>
            {showMyPage ? '홈으로' : '마이페이지'}
          </button>
        </div>
      )}

      {loggedIn ? (showMyPage ? <MyPage /> : <Home />) : <AuthForm />}
    </div>
  );
}

export default App;
