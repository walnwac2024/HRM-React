import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './userdetails/Login';
import Dashboard from './Dashbord/Dashbord'; // will act as a layout (has <Outlet/>)
import Home from './components/pages/Home/Home';

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout route: everything inside uses the Dashboard layout */}
        <Route element={<Dashboard />}>
          {/* default (/) goes to Home inside the Dashboard layout */}
          <Route path="/" element={<Home />} />
          {/* add more child pages here, e.g.: */}
          {/* <Route path="/employees" element={<AllEmployees />} /> */}
        </Route>

        {/* Standalone routes that should NOT use the Dashboard layout */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;



// {/* <Route element={<AdminLayout />}>
//         <Route path="/" element={<MainDashbord />} />
//         <Route path="/projects" element={<Projects />} />
//         <Route path="/clients" element={<Clients />} />
//         <Route path="/new-project" element={<CreateProjects />} />
        
//         <Route path="/new-client" element={<NewClient />} />
//         <Route path="/edit-project" element={<EditProject />} />
//         {/* teams routes */}
//         <Route path="/teams" element={<Teams />} />
//         <Route path="/new-team" element={<CreateTeam />} />
//         <Route path="/add-team-members" element={<AssignedMembers />} />
//         <Route path={routes.teams.UpdateTeams} element={<EditTeam />} />
//         <Route path={routes.teams.ViewTeam} element={<ViewTeam />} />
//         <Route path={routes.jotform.Allforms} element={<Forms />} />
//         <Route path={routes.jotform.ViewSubmission} element={<ViewSubmitForm />} />
//         <Route path={routes.jotform.Allsubmission} element={<Allforms />} />
//         <Route path="/forms/dynamic-form" element={<AutoBuilderForm />} />
//         <Route path={routes.jotform.OperatorReaderForm} element={<OperatorReaderForm />} />

//             <Route path="*" element={<Pagenotfound />} />

//         {/* end of team routs */}
//          <Route path="/project-details" element={<ViewDashbord />}>
//           <Route index element={<Overview />} />
//           <Route path="project-media" element={<ProjectMedia />} />
//         </Route>
    
//       </Route> */}