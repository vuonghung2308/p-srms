import { useContext } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { PayloadContext } from "./common/token";
import Login from "./components/common/Login";
import NotFound from "./components/common/NotFound";
import EmployeeLayout from "./components/employee";
import { ListClass as EListClass } from "./components/employee/class/ListClass";
import { ListClass as TListClass } from "./components/teacher/class/ListClass";
import { ClassStudents as EClassStudents } from "./components/employee/class/ClassStudents";
import { ClassStudents as TClassStudents } from "./components/teacher/class/ClassStudents";
import EmployeeInfo from "./components/employee/info/Info";
import StudentLayout from "./components/student";
import StudentInfo from "./components/student/info";
import StudentPoint from "./components/student/points";
import TeacherLayout from "./components/teacher";
import { ListRoom as TListRoom } from "./components/teacher/room/ListRoom";
import { ListRoom as EListRoom } from "./components/employee/room/ListRoom";
import { ListExam as EListExam } from "./components/employee/room/ListExam";
import { ListExam as TListExam } from "./components/teacher/room/ListExam";
import TeacherInfo from "./components/teacher/info";
import AdminLayout from "./components/admin";
import AdminInfo from "./components/admin/info";
import TransactionDetail from "./components/admin/transaction/TransactionDetail";
import StateHistory from "./components/admin/transaction/StateHistory";
import Backup from "./components/admin/backup/Backup";
import PointDetail from "./components/student/points/PointDetail";
import { ListClaim as TListClaim } from "./components/teacher/claim/ListClaim";
import { ListClaim as SListClaim } from "./components/student/claim/ListClaim";
import { ListClaim as EListClaim } from "./components/employee/claim/ListClaim";
import { ClaimDetail as EClaimDetail } from "./components/employee/claim/ClaimDetail";
import { ClaimDetail as TClaimDetail } from "./components/teacher/claim/ClaimDetail";
import { ClaimDetail as SClaimDetail } from "./components/student/claim/ClaimDetail";

export default function App() {
  const payload = useContext(PayloadContext);
  let routes;
  const setTitle = () => {
    document.title = 'P-SRMS - Hệ thống quản lý kết quả học tập';
  }
  switch (payload.type) {
    case "STUDENT": {
      setTitle();
      routes = (
        <Routes>
          <Route path="/" element={<StudentLayout />}>
            <Route index element={<StudentInfo />} />
            <Route path="*" element={<NotFound />} />
            <Route path="xem-diem" element={<Outlet />}>
              <Route index element={<StudentPoint />} />
              <Route path=":pointId" element={<PointDetail />} />
            </Route>
            <Route path="phuc-khao" element={<Outlet />}>
              <Route index element={<SListClaim />} />
              <Route path=":claimId" element={<SClaimDetail />} />
            </Route>
          </Route>
        </Routes>
      );
      break;
    }
    case "EMPLOYEE": {
      setTitle();
      routes = (
        <Routes>
          <Route path="/" element={<EmployeeLayout />}>
            <Route index element={<EmployeeInfo />} />
            <Route path="*" element={<NotFound />} />
            <Route path="lop-hoc" element={<Outlet />}>
              <Route index element={<EListClass />} />
              <Route path=":classId" element={<Outlet />}>
                <Route index element={<EClassStudents />} />
              </Route>
            </Route>
            <Route path="phong-thi" element={<Outlet />}>
              <Route index element={<EListRoom />} />
              <Route path=":roomId" element={<Outlet />}>
                <Route index element={<EListExam />} />
              </Route>
            </Route>
            <Route path="phuc-khao" element={<Outlet />}>
              <Route index element={<EListClaim />} />
              <Route path=":claimId" element={<EClaimDetail />} />
            </Route>
          </Route>
        </Routes>
      );
      break;
    }
    case "TEACHER": {
      setTitle();
      routes = (
        <Routes>
          <Route path="/" element={<TeacherLayout />}>
            <Route index element={<TeacherInfo />} />
            <Route path="*" element={<NotFound />} />
            <Route path="lop-hoc" element={<Outlet />}>
              <Route index element={<TListClass />} />
              <Route path=":classId" element={<TClassStudents />} />
            </Route>
            <Route path="phong-thi" element={<Outlet />}>
              <Route index element={<TListRoom />} />
              <Route path=":roomId" element={<Outlet />}>
                <Route index element={<TListExam />} />
              </Route>
            </Route>
            <Route path="phuc-khao" element={<Outlet />}>
              <Route index element={<TListClaim />} />
              <Route path=":claimId" element={<TClaimDetail />} />
            </Route>
          </Route>
        </Routes>
      );
      break;
    }
    case "ADMIN": {
      setTitle();
      routes = (
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<AdminInfo />} />
            <Route path="*" element={<NotFound />} />
            <Route path="giao-dich" element={<TransactionDetail />} />
            <Route path="lich-su" element={<StateHistory />} />
            <Route path="sao-luu-khoi-phuc" element={<Backup />} />
          </Route>
        </Routes>
      )
      break;
    }
    default: {
      setTitle();
      routes = (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      );
      break;
    }
  }

  return (
    <BrowserRouter>
      {routes}
    </BrowserRouter>
  );
}