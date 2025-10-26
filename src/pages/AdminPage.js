import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AdminPage = () => {
  const [usersByTeam, setUsersByTeam] = useState({});
  const [introRankings, setIntroRankings] = useState([]);
  const [teamFundingData, setTeamFundingData] = useState([]);
  const [fundedAmounts, setFundedAmounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userSnapshot = await getDocs(collection(db, 'users'));
      const users = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const grouped = {};
      users.forEach(user => {
        if (!grouped[user.team]) grouped[user.team] = [];
        grouped[user.team].push(user);
      });
      setUsersByTeam(grouped);

      const introSnapshot = await getDocs(collection(db, 'introductions'));
      const intros = introSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const sorted = intros
        .sort((a, b) => (b.fundedAmount || 0) - (a.fundedAmount || 0))
        .map((item, index) => ({
          rank: index + 1,
          team: item.team,
          amount: item.fundedAmount || 0,
        }));
      setIntroRankings(sorted);

      const fundingChartData = intros.map(item => ({
        team: item.team,
        fundedAmount: item.fundedAmount || 0,
      }));
      setTeamFundingData(fundingChartData);

      const teamFunds = {};
      intros.forEach(intro => {
        teamFunds[intro.team] = intro.fundedAmount || 0;
      });
      setFundedAmounts(teamFunds);
    };

    fetchData();
  }, []);

  const toggleLeader = async (userId, currentStatus) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isLeader: !currentStatus });

    setUsersByTeam(prev => {
      const updated = { ...prev };
      for (const team in updated) {
        updated[team] = updated[team].map(user =>
          user.id === userId ? { ...user, isLeader: !currentStatus } : user
        );
      }
      return updated;
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>관리자 페이지</h2>

      <p style={{ marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>
        현재 로그인한 관리자: admin1234 (관리자 전용 계정)
      </p>

      <button
        onClick={() => navigate('/')}
        style={{
          padding: '10px 16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        홈으로
      </button>

      <div style={{ marginBottom: '30px' }}>
        <h3>💰 프로젝트 펀딩 순위</h3>
        {introRankings.map(item => (
          <p key={item.rank}>
            {item.rank}. {item.team}팀: ₩{item.amount.toLocaleString()}
          </p>
        ))}
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3>📊 팀별 누적 펀딩 금액</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={teamFundingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="team" />
            <YAxis />
            <Tooltip formatter={value => `₩${value.toLocaleString()}`} />
            <Bar dataKey="fundedAmount" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.keys(usersByTeam)
          .filter(team => team !== 'admin')
          .sort((a, b) => a.localeCompare(b, 'ko-KR'))
          .map(team => (
            <table
              key={team}
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #ccc',
                backgroundColor: '#f8fff8',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#c0eacb' }}>
                  <th colSpan={4} style={{ padding: '12px', textAlign: 'left' }}>
                    {team}팀 (현재 투자금: ₩{fundedAmounts[team]?.toLocaleString() || '0'})
                  </th>
                </tr>
                <tr style={{ backgroundColor: '#a2d5a5' }}>
                  <th style={thStyle}>이름</th>
                  <th style={thStyle}>사용한 투자금</th>
                  <th style={thStyle}>남은 투자금</th>
                  <th style={thStyle}>팀장 여부</th>
                </tr>
              </thead>
              <tbody>
                {usersByTeam[team].map(user => (
                  <tr key={user.id}>
                    <td style={tdStyle}>{user.name}</td>
                    <td style={tdStyle}>₩{(1000000 - (user.balance || 0)).toLocaleString()}</td>
                    <td style={tdStyle}>₩{(user.balance || 0).toLocaleString()}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => toggleLeader(user.id, user.isLeader)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: user.isLeader ? '#bbb' : '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        {user.isLeader ? '팀장 해제' : '팀장 지정'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
      </div>
    </div>
  );
};

const thStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  backgroundColor: '#e5f7e7',
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  textAlign: 'center',
};

export default AdminPage;
