// src/components/TestData.tsx
import { useEffect, useState } from 'react';

type TestItem = {
  _id: string;
  base: string;
};

export default function TestData() {
  const [devData, setDevData] = useState<TestItem[]>([]);
  const [prodData, setProdData] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devRes, prodRes] = await Promise.all([
          fetch('http://localhost:3000/check-dev-db'),
          fetch('http://localhost:3000/check-prod-db'),
        ]);

        const devJson = await devRes.json();
        const prodJson = await prodRes.json();

        setDevData(devJson.data || []);
        setProdData(prodJson.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div>
      <h2>Datos de la base DEV</h2>
      <ul>
        {devData.map((item) => (
          <li key={item._id}>
            {item.base}
          </li>
        ))}
      </ul>

      <h2>Datos de la base PROD</h2>
      <ul>
        {prodData.map((item) => (
          <li key={item._id}>
            {item.base}
          </li>
        ))}
      </ul>
    </div>
  );
}
