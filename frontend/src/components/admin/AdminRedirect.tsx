import { useEffect, FC } from 'react';

const AdminRedirect: FC = () => {
  useEffect(() => {
    window.location.href = '/admin/html/login.html';
  }, []);

  return null;
};

export default AdminRedirect;
