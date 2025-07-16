// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { addDoc} from 'firebase/firestore';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [fundAmounts, setFundAmounts] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUserData({ ...userSnap.data(), id: user.uid });

        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projectList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectList);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFund = async (projectId) => {
    const amount = parseInt(fundAmounts[projectId]);
    if (!amount || amount <= 0) return alert('올바른 금액을 입력하세요.');
    if (amount > userData.balance) return alert('잔액이 부족합니다.');

    try {
      // 프로젝트 펀딩 금액 증가
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        fundedAmount: increment(amount)
      });

      // 사용자 잔액 감소
      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        balance: userData.balance - amount
      });

      await addDoc(collection(db, 'fundingLogs'), {
  userId: userData.id,
  projectId: projectId,
  amount: amount,
  createdAt: new Date()
});

      // 화면 상태 업데이트
      setUserData((prev) => ({
        ...prev,
        balance: prev.balance - amount
      }));
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, fundedAmount: p.fundedAmount + amount } : p
        )
      );
      setFundAmounts((prev) => ({ ...prev, [projectId]: '' }));

      alert('펀딩 완료!');
    } catch (error) {
      console.error('펀딩 오류:', error);
      alert('펀딩 실패');
    }
  };

  if (!userData) return <p>로딩 중...</p>;

  return (
    <div>
      <h2>환영합니다, {userData.name}님!</h2>
      <p>현재 잔액: ₩{userData.balance.toLocaleString()}원</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '30px' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '16px',
              width: '250px',
            }}
          >
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p>총 펀딩액: ₩{project.fundedAmount.toLocaleString()}원</p>
            <input
              type="number"
              placeholder="금액 입력"
              value={fundAmounts[project.id] || ''}
              onChange={(e) =>
                setFundAmounts((prev) => ({ ...prev, [project.id]: e.target.value }))
              }
            />
            <button onClick={() => handleFund(project.id)}>펀딩하기</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
