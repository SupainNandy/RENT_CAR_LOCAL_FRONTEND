import React from 'react'
import MainRoutes from './routes/MainRoutes'
import { authContext } from './context/contextApi'


const App = () => {
  const [loggedIn, setLoggedIn] = React.useState(
    localStorage.getItem('loggedIn') === 'true'
  );

  const [name, setName] = React.useState(
    localStorage.getItem('name') || ''
  );

  // Keep localStorage in sync whenever name changes (e.g. after a profile
  // update), so a page refresh doesn't revert the displayed name.
  React.useEffect(() => {
    if (name) {
      localStorage.setItem('name', name);
    }
  }, [name]);

  return (
    <authContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        name,
        setName
      }}
    >
      <MainRoutes />
    </authContext.Provider>
  );
};

export default App;