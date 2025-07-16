// src/pages/MyPage.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';

const MyPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) setUserName(userSnap.data().name);

          const q = query(collection(db, 'fundingLogs'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);

          const logsWithProject = await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              const projectRef = doc(db, 'projects', data.projectId);
              const projectSnap = await getDoc(projectRef);
              const projectTitle = projectSnap.exists() ? projectSnap.data().title : '알 수 없음';

              return {
                id: docSnap.id,
                projectTitle,
                amount: data.amount,
                createdAt: data.createdAt?.toDate().toLocaleString()
              };
            })
          );

          setLogs(logsWithProject);
          setLoading(false);
        }
      });
    };

    fetchLogs();
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h2>{userName}님의 마이페이지</h2>
      <h3>펀딩 내역</h3>
      {logs.length === 0 ? (
        <p>아직 펀딩한 내역이 없습니다.</p>
      ) : (
        <ul>
          {logs.map((log) => (
            <li key={log.id}>
              [{log.createdAt}] <strong>{log.projectTitle}</strong> 프로젝트에 ₩{log.amount.toLocaleString()} 펀딩함
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyPage;
