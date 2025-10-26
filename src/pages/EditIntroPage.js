// src/pages/EditIntroPage.js
import React, { useEffect, useRef, useState } from 'react';
import { auth, db, storage } from '../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

const EditIntroPage = () => {
  const [userData, setUserData] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // local File objects
  const [imageUrls, setImageUrls] = useState([]);   // uploaded or loaded image URLs
  const [introId, setIntroId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
        if (!userSnap.empty) {
          const data = userSnap.docs[0].data();
          const uid = userSnap.docs[0].id;
          const userInfo = { ...data, id: uid };
          setUserData(userInfo);

          if (!data.isLeader) {
            alert('팀장만 접근 가능합니다.');
            navigate('/');
            return;
          }

          const introSnap = await getDocs(query(collection(db, 'introductions'), where('team', '==', data.team)));
          if (!introSnap.empty) {
            const introDoc = introSnap.docs[0];
            setIntroId(introDoc.id);
            const introData = introDoc.data();
            setTitle(introData.title || '');
            setDescription(introData.description || '');
            setImageUrls(introData.imageUrls || []);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.slice(0, 5 - imageUrls.length);
    if (imageUrls.length + newFiles.length > 5) {
      alert('최대 5장까지만 업로드할 수 있습니다.');
      return;
    }
    setImageFiles((prev) => [...prev, ...newFiles]);
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...previews]);
  };

  const handleRemoveImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImageUrls(newUrls);

    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e, idx) => {
    e.dataTransfer.setData('index', idx);
  };

  const handleDrop = (e, idx) => {
    const fromIndex = parseInt(e.dataTransfer.getData('index'));
    if (fromIndex === idx) return;

    const newUrls = [...imageUrls];
    const newFiles = [...imageFiles];

    const [movedUrl] = newUrls.splice(fromIndex, 1);
    const [movedFile] = newFiles.splice(fromIndex, 1);

    newUrls.splice(idx, 0, movedUrl);
    newFiles.splice(idx, 0, movedFile);

    setImageUrls(newUrls);
    setImageFiles(newFiles);
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (title.length > 50) {
      alert('제목은 최대 50자까지 입력 가능합니다.');
      setIsSubmitting(false);
      return;
    }

    try {
      let uploadedUrls = [];

      for (const file of imageFiles) {
        const storageRef = ref(storage, `introImages/${userData.team}_${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      const introData = {
        team: userData.team,
        title,
        description,
        imageUrls: uploadedUrls,
        ...(introId ? {} : { fundedAmount: 0 }),
        createdBy: userData.name,
      };

      if (introId) {
        await updateDoc(doc(db, 'introductions', introId), introData);
        alert('소개 수정 완료!');
      } else {
        const existingSnap = await getDocs(query(collection(db, 'introductions'), where('team', '==', userData.team)));
        if (!existingSnap.empty) {
          alert('이미 등록된 팀 소개가 있습니다. 수정 모드로 진행해주세요.');
          setIsSubmitting(false);
          return;
        }

        await addDoc(collection(db, 'introductions'), introData);
        alert('소개 등록 완료!');
      }

      navigate('/');
    } catch (err) {
      console.error('저장 실패:', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>팀 소개 등록/수정</h2>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>제목 (50자 이내)</strong></p>
        <input
          type="text"
          maxLength="50"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          placeholder="예: 우리팀의 놀라운 프로젝트"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>사진 (최대 5장, 드래그로 순서 변경 가능)</strong></p>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          {imageUrls.length === 0 ? (
            <p style={{ color: '#888' }}>등록된 파일 없음</p>
          ) : (
            imageUrls.map((url, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => handleDrag(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                style={{ position: 'relative' }}
              >
                <img src={url} alt={`preview-${idx}`} style={{ width: '100%' }} />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>부연 설명 입력</strong></p>
        <textarea
          rows="6"
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isSubmitting ? '#999' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            minWidth: '100px'
          }}
        >
          {isSubmitting ? '로딩 중...' : (introId ? '수정하기' : '등록하기')}
        </button>
        <button
          onClick={() => navigate('/')}
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#ccc',
            border: 'none',
            borderRadius: '6px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          취소하기
        </button>
      </div>
    </div>
  );
};

export default EditIntroPage;