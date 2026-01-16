

// 'use client';

// import { useSearchParams, useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { User, Building2, Sparkles } from 'lucide-react';

// function decodeJWT(token: string) {
//   try {
//     const payload = token.split('.')[1];
//     const decoded = JSON.parse(atob(payload));
//     return decoded;
//   } catch (error) {
//     return null;
//   }
// }

// export default function SelectType() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const token = searchParams.get('token');
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     if (token) {
//       localStorage.setItem('token', token);
//       const decoded = decodeJWT(token);
//       if (decoded) {
//         setUser(decoded);
//       }
//     }
//   }, [token]);

//   const handleTypeSelect = async (type: 'CREATOR' | 'BRAND') => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/user/type`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({ type }),
//       });

//       if (response.ok) {
//         localStorage.setItem('userType', type.toLowerCase());
//         router.push('/profile?token=' + token);
//       } else {
//         alert('Error updating user type');
//       }
//     } catch (error) {
//       alert('Error updating user type');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!token || !user) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
//       <div className="max-w-4xl w-full mx-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-16"
//         >
  
//           <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
//             Welcome, {user.name}
//           </h1>
//           <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
//             Choose your account type to get started
//           </p>
//         </motion.div>

//         <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
//           {/* Creator Card */}
//           <motion.div
//             whileHover={{ y: -4 }}
//             whileTap={{ scale: 0.98 }}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.1 }}
//             className="group cursor-pointer"
//             onClick={() => handleTypeSelect('CREATOR')}
//           >
//             <div className="h-full bg-white border border-gray-200 rounded-3xl p-10 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
//               <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-8">
//                 <User className="w-7 h-7 text-white" />
//               </div>
//               <h3 className="text-2xl font-normal text-gray-900 mb-3">I'm a Creator</h3>
//               <p className="text-gray-600 font-light leading-relaxed">
//                 Connect with brands, set fair rates based on your analytics, and manage collaborations seamlessly.
//               </p>
//             </div>
//           </motion.div>

//           {/* Brand Card */}
//           <motion.div
//             whileHover={{ y: -4 }}
//             whileTap={{ scale: 0.98 }}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.2 }}
//             className="group cursor-pointer"
//             onClick={() => handleTypeSelect('BRAND')}
//           >
//             <div className="h-full bg-white border border-gray-200 rounded-3xl p-10 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
//               <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-8">
//                 <Building2 className="w-7 h-7 text-white" />
//               </div>
//               <h3 className="text-2xl font-normal text-gray-900 mb-3">I'm a Brand</h3>
//               <p className="text-gray-600 font-light leading-relaxed">
//                 Discover verified creators, launch campaigns, and track performance with transparent tools.
//               </p>
//             </div>
//           </motion.div>
//         </div>

//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//           className="text-center mt-12"
//         >
//           <p className="text-sm text-gray-500 font-light">
//             You can change your account type later in settings
//           </p>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { User, Building2 } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    return null;
  }
}

function SelectTypeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authCode = searchParams.get('auth_code');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (authCode) {
      // Remove auth code from URL immediately for security
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('auth_code');
      window.history.replaceState({}, '', newUrl.toString());

      const exchangeAuthCode = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: authCode }),
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Auth exchange failed');
          }

          const { token: authToken } = await response.json();
          if (authToken) {
            localStorage.setItem('token', authToken);
            setToken(authToken);
            const decoded = decodeJWT(authToken);
            if (decoded) {
              setUser(decoded);
            }
          }
        } catch (err) {
          console.error('Auth code exchange error:', err);
        }
      };

      exchangeAuthCode();
    } else {
      // Check localStorage for existing token
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = decodeJWT(storedToken);
        if (decoded) {
          setUser(decoded);
        }
      }
    }
  }, [authCode]);

  const handleTypeSelect = async (type: 'CREATOR' | 'BRAND') => {
    setLoading(true);
    const currentToken = token || localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        localStorage.setItem('userType', type.toLowerCase());
        // Navigate to profile without token in URL
        router.push('/profile');
      } else {
        alert('Error updating user type');
      }
    } catch (error) {
      alert('Error updating user type');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-4xl w-full mx-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            Welcome, {user.name}
          </h1>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Choose your account type to get started
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Creator Card */}
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="group cursor-pointer"
            onClick={() => handleTypeSelect('CREATOR')}
          >
            <div className="h-full bg-white border border-gray-200 rounded-3xl p-10 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-8">
                <User className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-normal text-gray-900 mb-3">I'm a Creator</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Connect with brands, showcase your analytics, and manage collaborations seamlessly.
              </p>
            </div>
          </motion.div>

          {/* Brand Card */}
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="group cursor-pointer"
            onClick={() => handleTypeSelect('BRAND')}
          >
            <div className="h-full bg-white border border-gray-200 rounded-3xl p-10 transition-all duration-300 hover:border-gray-300 hover:shadow-sm">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-8">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-normal text-gray-900 mb-3">I'm a Brand</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Discover verified creators, launch campaigns, and track performance with transparent tools.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-500 font-light">
            You can change your account type later in settings
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SelectType() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SelectTypeContent />
    </Suspense>
  );
}
