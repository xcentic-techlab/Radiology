import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "@/api/axios";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DepartmentTests() {
  const { id } = useParams();
  const [tests, setTests] = useState([]);
  const [department, setDepartment] = useState(null);

  const hasFetched = useRef(false); // 🛑 stops double fetch

  useEffect(() => {
    if (!hasFetched.current) {
      load();
      hasFetched.current = true;
    }
  }, []);

  async function load() {
    console.log("FETCH CALLED"); // check only once

    // const dept = await axios.get(`${import.meta.env.VITE_API_URL}/api/departments/${id}`);
    const dept = await axios.get(`/departments/${id}`);
    setDepartment(dept.data);

    // const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/department/${id}`);
    const res = await axios.get(`/tests/department/${id}`);
    setTests(res.data);
  }

return (
  <>
    <div className="p-6 space-y-6">

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Tests under: <span className="text-blue-600">{department?.name}</span>
        </h1>
        <p className="text-muted-foreground">
          List of all tests associated with this department
        </p>
      </div>

      {/* GLASS CARD */}
      <div className="
        rounded-2xl 
        bg-white/60 
        backdrop-blur 
        border border-white/40 
        shadow-xl 
        p-6
      ">
        
        {/* TABLE WRAPPER FOR SCROLL */}
        <div className="overflow-x-auto rounded-xl border shadow-sm">

          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border text-left">Test ID</th>
                <th className="p-3 border text-left">Test Name</th>
                <th className="p-3 border text-left">MRP</th>
                <th className="p-3 border text-left">Offer Rate</th>
                <th className="p-3 border text-left">Code</th>
              </tr>
            </thead>

            <tbody>
              {tests.map((t) => (
                <tr
                  key={t._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 border text-sm">{t.itemid}</td>
                  <td className="p-3 border font-medium">{t.name}</td>
                  <td className="p-3 border text-green-700 font-semibold">
                    ₹{t.price}
                  </td>
                  <td className="p-3 border text-blue-700 font-semibold">
                    ₹{t.offerRate}
                  </td>
                  <td className="p-3 border">{t.code}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>

    </div>
  </>
);

}
