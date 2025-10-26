// src/App.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import AuthForm from './components/AuthForm';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import EditIntroPage from './pages/EditIntroPage';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const navigate = useNavigate();

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
      setShowMyPage(false);
      navigate('/');
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 실패');
    }
  };

  if (!loggedIn) return <AuthForm />;

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={handleLogout}>로그아웃</button>
        <button onClick={() => {
          setShowMyPage((prev) => {
            const next = !prev;
            navigate(next ? '/mypage' : '/');
            return next;
          });
        }}>
          {showMyPage ? '홈으로' : '마이페이지'}
        </button>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/adminpage" element={<AdminPage />} />
        <Route path="/editintro" element={<EditIntroPage />} />
      </Routes>
    </div>
  );
}

export default App;
