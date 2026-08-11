import { useState, useEffect, useContext } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../utils/firebase.config"; 
import { AuthContext } from "../../AuthProvider/AuthProvider"; 

const StudioDashboard = () => {
  const { user, login, logout, isLoading } = useContext(AuthContext); 
  
  // Tab State
  const [activeTab, setActiveTab] = useState("commissions"); // 'commissions', 'inquiries', or 'users'
  
  // Data States
  const [commissions, setCommissions] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [fetching, setFetching] = useState(false);
  
  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false); 

  const isAdmin = user?.email?.toLowerCase() === "sakshita229@gmail.com";

  // Fetch data based on which tab is active
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setFetching(true);
      try {
        if (activeTab === "commissions") {
          const q = query(collection(db, "commissions"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          setCommissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } 
        else if (activeTab === "inquiries") {
          // Ensure your contact form saves to a collection named "inquiries" or "messages"
          const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } 
        else if (activeTab === "users") {
          // Fetches from your "users" Firestore collection
          const q = query(collection(db, "users"));
          const snapshot = await getDocs(q);
          setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [isAdmin, activeTab]); // Re-runs every time you click a new tab

  const handleSecretLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || "Incorrect credentials. Access denied.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-base-white"></div>;

  // 🛑 IF NOT LOGGED IN
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-white font-sans px-4">
        <form onSubmit={handleSecretLogin} className="p-10 border border-sand shadow-sm rounded-sm w-full max-w-sm bg-base-white">
          <h2 className="text-xl font-serif text-text-main mb-6 text-center">Studio Access</h2>
          
          {user && !isAdmin && (
            <div className="bg-blue-50 text-blue-800 text-[10px] uppercase tracking-widest p-4 mb-6 rounded-sm border border-blue-200 text-center">
              Logged in as:<br/> 
              <strong className="text-sm lowercase mt-1 block">{user.email}</strong><br/>
              This email is not authorized.
              <button type="button" onClick={logout} className="mt-4 block w-full border border-blue-800 py-2 hover:bg-blue-800 hover:text-white transition-colors cursor-pointer">
                Log Out & Try Again
              </button>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-500 text-[10px] uppercase p-3 mb-6 rounded-sm border border-red-100 text-center">{error}</div>}

          {!user && (
            <>
              <input type="email" placeholder="Staff Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-sand py-2 text-text-main focus:outline-none focus:border-olive mb-6 text-sm placeholder-dove/50" required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-b border-sand py-2 text-text-main focus:outline-none focus:border-olive mb-8 text-sm placeholder-dove/50" required />
              <button type="submit" disabled={isLoggingIn} className="w-full py-3 bg-text-main text-base-white text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-olive transition-colors cursor-pointer rounded-sm disabled:opacity-50">
                {isLoggingIn ? "Unlocking..." : "Unlock Dashboard"}
              </button>
            </>
          )}
        </form>
      </div>
    );
  }

  // ✨ IF LOGGED IN: Show the Dashboard
  return (
    <div className="min-h-screen bg-sand/10 p-8 md:p-12 font-sans text-text-main pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Logout */}
        <div className="flex justify-between items-end mb-8 border-b border-sand pb-4">
          <div>
            <h1 className="text-3xl font-serif">Studio Dashboard</h1>
            <p className="text-sm text-dove mt-2">Welcome back, Sakshita.</p>
          </div>
          <button onClick={logout} className="text-[10px] uppercase tracking-widest text-dove hover:text-red-500 transition-colors cursor-pointer mb-2">
            Lock Door
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-6 mb-8 border-b border-sand/50">
          {["commissions", "inquiries", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                activeTab === tab 
                  ? "border-b-2 border-olive text-text-main" 
                  : "text-dove hover:text-text-main"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading State for Tabs */}
        {fetching && <p className="text-sm text-olive animate-pulse font-bold uppercase tracking-widest mb-10">Loading data...</p>}

        {/* TAB 1: COMMISSIONS */}
        {!fetching && activeTab === "commissions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commissions.length === 0 ? <p className="text-sm text-dove p-4 border border-sand bg-base-white w-full col-span-full">No commission requests yet.</p> : null}
            {commissions.map((req) => (
              <div key={req.id} className="bg-base-white p-6 border border-sand shadow-sm rounded-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{req.name}</h3>
                    <a href={`mailto:${req.email}`} className="text-[11px] text-olive hover:underline">{req.email}</a>
                  </div>
                </div>
                <div className="text-sm text-dove space-y-2 mb-4 flex-grow">
                  <p><strong>Size:</strong> {req.size}</p>
                  <p><strong>Medium:</strong> {req.medium}</p>
                  {req.vision && <div className="pt-3 mt-3 border-t border-sand/50"><p className="italic">"{req.vision}"</p></div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: INQUIRIES */}
        {!fetching && activeTab === "inquiries" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inquiries.length === 0 ? <p className="text-sm text-dove p-4 border border-sand bg-base-white w-full col-span-full">No inquiries received yet.</p> : null}
            {inquiries.map((msg) => (
              <div key={msg.id} className="bg-base-white p-6 border border-sand shadow-sm rounded-sm">
                <h3 className="font-semibold text-lg">{msg.name}</h3>
                <a href={`mailto:${msg.email}`} className="text-[11px] text-olive hover:underline">{msg.email}</a>
                <p className="mt-4 text-sm text-dove italic">"{msg.message || msg.note}"</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: USERS */}
        {!fetching && activeTab === "users" && (
          <div className="bg-base-white border border-sand rounded-sm overflow-hidden shadow-sm">
            {usersList.length === 0 ? (
              <p className="text-sm text-dove p-6">No users found. Make sure user data is saving to a "users" Firestore collection upon registration.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-sand/20 text-xs uppercase tracking-widest text-dove">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/50">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-sand/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-main">{u.name || "N/A"}</td>
                      <td className="px-6 py-4 text-olive">{u.email}</td>
                      <td className="px-6 py-4 text-dove">
                        {u.createdAt?.toDate ? new Date(u.createdAt.toDate()).toLocaleDateString() : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudioDashboard;