import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [introductions, setIntroductions] = useState([]);
  const [fundingLogs, setFundingLogs] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [inputAmount, setInputAmount] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userInfo = { ...userSnap.data(), id: user.uid, email: user.email };
      setUserData(userInfo);

      const introSnapshot = await getDocs(collection(db, 'introductions'));
      const introList = introSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIntroductions(introList);

      const logSnapshot = await getDocs(
        query(collection(db, 'fundingLogs'), where('userId', '==', user.uid))
      );
      const logList = logSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFundingLogs(logList);
    });

    return () => unsubscribe();
  }, []);

  const getUserFundingAmount = (team) => {
    const log = fundingLogs.find((log) => log.teamFunded === team);
    return log ? log.amount : 0;
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    const current = getUserFundingAmount(project.team);
    setInputAmount(current.toString());
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedProject(null);
    setInputAmount('');
    setShowEditModal(false);
  };

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);

    const urls = project.imageUrls || [];
    if (urls.length > 0) {
      preloadImages(urls);
    } else {
      setPreloadedImages([]);
      setIsImagesLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedProject(null);
    setShowDetailModal(false);
    setPreloadedImages([]);
  };

  const preloadImages = (urls) => {
    setIsImagesLoading(true);
    const loadedImages = [];
    let loadedCount = 0;

    urls.forEach((url, idx) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedImages[idx] = url;
        loadedCount++;
        if (loadedCount === urls.length) {
          setPreloadedImages(loadedImages);
          setIsImagesLoading(false);
        }
      };
      img.onerror = () => {
        loadedImages[idx] = null;
        loadedCount++;
        if (loadedCount === urls.length) {
          setPreloadedImages(loadedImages);
          setIsImagesLoading(false);
        }
      };
    });
  };

  const handleEditFunding = async () => {
    const newAmount = parseInt(inputAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      alert('올바른 금액을 입력하세요.');
      return;
    }

    const currentLog = fundingLogs.find(
      (log) => log.teamFunded === selectedProject.team
    );
    const currentAmount = currentLog ? currentLog.amount : 0;
    const diff = newAmount - currentAmount;

    if (diff > userData.balance) {
      alert('잔액이 부족합니다.');
      return;
    }

    if (userData.team === selectedProject.team) {
      alert('본인 팀에는 투자할 수 없습니다.');
      return;
    }

    try {
      const introRef = doc(db, 'introductions', selectedProject.id);
      await updateDoc(introRef, {
        fundedAmount: increment(diff),
      });

      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        balance: increment(-diff),
      });

      const logsRef = collection(db, 'fundingLogs');
      if (currentLog) {
        const logRef = doc(db, 'fundingLogs', currentLog.id);
        if (newAmount === 0) {
          await deleteDoc(logRef);
        } else {
          await updateDoc(logRef, { amount: newAmount });
        }
      } else {
        if (newAmount > 0) {
          await addDoc(logsRef, {
            userId: userData.id,
            teamFunded: selectedProject.team,
            amount: newAmount,
            createdAt: new Date(),
          });
        }
      }

      setUserData((prev) => ({
        ...prev,
        balance: prev.balance - diff,
      }));

      setFundingLogs((prev) => {
        const updated = prev.filter(
          (log) => log.teamFunded !== selectedProject.team
        );
        return newAmount > 0
          ? [
              ...updated,
              {
                teamFunded: selectedProject.team,
                amount: newAmount,
              },
            ]
          : updated;
      });

      closeEditModal();
      alert('투자금이 수정되었습니다.');
    } catch (error) {
      console.error('투자 수정 오류:', error);
      alert('수정 실패');
    }
  };

  if (!userData) return <p>로딩 중...</p>;

  return (
    <div style={{ padding: '20px' }}>
      {userData.email === 'admin1234@naver.com' && (
        <button
          onClick={() => navigate('/adminpage')}
          style={buttonStyle('#28a745')}
        >
          관리자 페이지
        </button>
      )}

      {userData.isLeader && (
        <button
          onClick={() => navigate('/editintro')}
          style={buttonStyle('#ff9800')}
        >
          프로젝트 등록 / 수정
        </button>
      )}

      <h2>투자 현황</h2>
      <div>팀명: <strong>{userData.team}</strong></div>
      <div>이름: <strong>{userData.name}</strong></div>
      <div>투자 가능 금액: <strong>₩{userData.balance.toLocaleString()}</strong></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {introductions.map((item) => {
          const myFunding = getUserFundingAmount(item.team);
          return (
            <div
              key={item.id}
              onClick={() => openDetailModal(item)}
              style={projectCardStyle}
            >
              <div>
                <strong>{item.team}팀</strong> - {item.title}
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                  전체 투자 금액: <strong>₩{(item.fundedAmount || 0).toLocaleString()}</strong>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ marginBottom: '8px' }}>
                  내 투자 금액: <strong>₩{myFunding.toLocaleString()}</strong>
                </p>
                {userData.team !== item.team && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                    style={buttonStyle('#007bff')}
                  >
                    투자금 수정하기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 투자 수정 모달 */}
      {showEditModal && selectedProject && (
        <div style={popupOverlayStyle} onClick={closeEditModal}>
          <div style={popupContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedProject.team}팀 - 투자금 수정</h3>
            <p>현재 투자 금액: ₩{getUserFundingAmount(selectedProject.team).toLocaleString()}</p>
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="변경할 금액 입력"
              style={{ padding: '10px', fontSize: '16px', width: '100%', marginTop: '12px' }}
            />
            <button onClick={handleEditFunding} style={popupButtonStyle}>수정하기</button>
            <button onClick={closeEditModal} style={{ ...popupButtonStyle, backgroundColor: '#ccc' }}>닫기</button>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {showDetailModal && selectedProject && (
        <div style={popupOverlayStyle} onClick={closeDetailModal}>
          <div style={popupContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedProject.team}팀 - {selectedProject.title}</h3>
            {isImagesLoading ? (
              <p>이미지 로딩 중...</p>
            ) : preloadedImages.length > 0 ? (
              preloadedImages.map((url, idx) =>
                url ? (
                  <img
                    key={idx}
                    src={url}
                    alt={`project-${idx}`}
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', marginBottom: '16px' }}
                  />
                ) : null
              )
            ) : (
              <p style={{ color: '#888' }}>등록된 이미지가 없습니다.</p>
            )}
            <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{selectedProject.description}</pre>
            <button onClick={closeDetailModal} style={{ ...popupButtonStyle, backgroundColor: '#ccc' }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

const buttonStyle = (bgColor) => ({
  padding: '10px 16px',
  marginBottom: '20px',
  backgroundColor: bgColor,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
});

const projectCardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
};

const popupOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
};

const popupContentStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '8px',
  width: '400px',
  textAlign: 'center',
  maxHeight: '80vh',
  overflowY: 'auto',
};

const popupButtonStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  marginTop: '10px',
};

export default Home;
