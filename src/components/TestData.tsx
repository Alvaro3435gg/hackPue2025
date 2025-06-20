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
  const apiUrl = import.meta.env.VITE_API_URL; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devRes, prodRes] = await Promise.all([
          fetch(`${apiUrl}check-dev-db`),
          fetch(`${apiUrl}check-prod-db`),
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
