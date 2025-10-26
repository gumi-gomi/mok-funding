import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';

const MyPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(''); // ✅ 팀 필터

  useEffect(() => {
    const fetchLogs = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const userInfo = { ...userSnap.data(), id: user.uid };
        setUserData(userInfo);

        const q = query(
          collection(db, 'fundingLogs'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);

        const logsWithProject = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let projectTitle = '알 수 없음';
            let projectId = null;
            let team = data.teamFunded;

            if (team) {
              const introQuery = query(
                collection(db, 'introductions'),
                where('team', '==', team)
              );
              const introSnap = await getDocs(introQuery);

              if (!introSnap.empty) {
                const intro = introSnap.docs[0];
                projectTitle = intro.data().title || '제목 없음';
                projectId = intro.id;
              }
            }

            return {
              id: docSnap.id,
              projectTitle,
              projectId,
              teamFunded: data.teamFunded,
              amount: data.amount,
              createdAt: data.createdAt?.toDate().toLocaleString(),
              createdAtRaw: data.createdAt?.toDate(),
            };
          })
        );

        logsWithProject.sort((a, b) => b.createdAtRaw - a.createdAtRaw); // 최신순

        setLogs(logsWithProject);
        setLoading(false);
      });
    };

    fetchLogs();
  }, []);

  const handleCancelFunding = async (log) => {
    const confirm = window.confirm('정말 이 펀딩을 취소하시겠습니까?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'fundingLogs', log.id));

      if (log.projectId) {
        const introRef = doc(db, 'introductions', log.projectId);
        await updateDoc(introRef, {
          fundedAmount: increment(-log.amount),
        });
      }

      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        balance: increment(log.amount),
      });

      setLogs((prev) => prev.filter((l) => l.id !== log.id));
      setUserData((prev) => ({
        ...prev,
        balance: prev.balance + log.amount,
      }));

      alert('펀딩이 취소되었습니다.');
    } catch (error) {
      console.error('펀딩 취소 오류:', error);
      alert('펀딩 취소에 실패했습니다.');
    }
  };

  if (loading) return <p>로딩 중...</p>;

  // ✅ 선택된 팀만 필터링
  const filteredLogs = logs.filter(
    (log) => selectedTeam === '' || log.teamFunded === selectedTeam
  );

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>{userData?.name}님의 마이페이지</h2>
      <h3>펀딩 내역</h3>

      {/* ✅ 팀 필터 드롭다운 */}
      {logs.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ marginRight: '8px' }}>팀별 필터:</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={{ padding: '6px', fontSize: '14px' }}
          >
            <option value="">전체</option>
            {Array.from(new Set(logs.map((log) => log.teamFunded))).map(
              (team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              )
            )}
          </select>
        </div>
      )}

      {filteredLogs.length === 0 ? (
        <p>펀딩 내역이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredLogs.map((log) => (
            <li
              key={log.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
              }}
            >
              <p>
                [{log.createdAt}] <strong>{log.projectTitle}</strong> 프로젝트에<br />
                <strong>₩{log.amount.toLocaleString()}</strong> 펀딩함
              </p>
              <button
                onClick={() => handleCancelFunding(log)}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                펀딩 취소
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyPage;
