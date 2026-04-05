/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { 
  TrendingUp, 
  Package, 
  PieChart, 
  Sparkles, 
  Users, 
  Lightbulb, 
  CheckCircle2, 
  ChevronRight,
  Menu,
  X,
  Instagram,
  Facebook,
  Linkedin,
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Bell,
  MoreVertical,
  Trash2,
  DollarSign,
  ShoppingCart,
  GraduationCap,
  Rocket,
  Heart,
  Target,
  Zap
} from "lucide-react";
import { useState, useRef, FormEvent, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

// --- Types ---

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: Timestamp;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  salesCount: number;
  ownerId: string;
  createdAt: Timestamp;
}

interface Order {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  ownerId: string;
  createdAt: Timestamp;
}

// --- Components ---

const Navbar = ({ onStartClick, view, setView, userProfile }: { onStartClick: () => void, view: string, setView: (v: string) => void, userProfile: UserProfile | null }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('landing');
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => setView('landing')}>
            <span className="text-2xl font-display font-black text-primary tracking-tighter">
              FEMCASH<span className="text-accent">EXPRESS</span>
            </span>
          </div>
          
          {view === 'landing' && (
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-primary transition-colors">Services</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">Comment ça marche</a>
              <a href="#experience" className="text-gray-600 hover:text-primary transition-colors">Expérience</a>
              {!userProfile && <button onClick={onStartClick} className="btn-primary">Commencer</button>}
              {userProfile && <button onClick={() => setView('dashboard')} className="btn-primary">Mon Espace</button>}
            </div>
          )}

          {view === 'dashboard' && userProfile && (
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(userProfile.displayName)}
                </div>
                <span className="text-sm font-medium text-gray-700">{userProfile.displayName}</span>
              </div>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2">
                <LogOut size={18} />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          )}

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-primary">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {view === 'landing' ? (
                <>
                  <a href="#services" className="block text-gray-600 px-4 py-2" onClick={() => setIsOpen(false)}>Services</a>
                  <a href="#how-it-works" className="block text-gray-600 px-4 py-2" onClick={() => setIsOpen(false)}>Comment ça marche</a>
                  <a href="#experience" className="block text-gray-600 px-4 py-2" onClick={() => setIsOpen(false)}>Expérience</a>
                  {!userProfile ? (
                    <button onClick={() => { onStartClick(); setIsOpen(false); }} className="w-full btn-primary">Commencer</button>
                  ) : (
                    <button onClick={() => { setView('dashboard'); setIsOpen(false); }} className="w-full btn-primary">Mon Espace</button>
                  )}
                </>
              ) : (
                userProfile && (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {getInitials(userProfile.displayName)}
                      </div>
                      <span className="font-medium text-gray-700">{userProfile.displayName}</span>
                    </div>
                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full py-3 text-red-500 font-medium flex items-center justify-center gap-2">
                      <LogOut size={20} /> Déconnexion
                    </button>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onStartClick, onHowItWorksClick }: { onStartClick: () => void, onHowItWorksClick: () => void }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-light px-4 py-2 rounded-full text-primary font-medium text-sm mb-6">
              <Sparkles size={16} />
              <span>La mini-app n°1 pour les entrepreneures</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-black leading-tight mb-6">
              VENDS <span className="text-primary">PLUS.</span><br />
              GÈRE <span className="text-accent">MIEUX.</span><br />
              ENCAISSE <span className="text-primary">PLUS.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              La mini-app pensée pour les femmes entrepreneures africaines qui veulent développer leurs ventes et structurer leur business facilement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={onStartClick} className="btn-primary flex items-center justify-center gap-2">
                Crée ton compte <ArrowRight size={20} />
              </button>
              <button onClick={onHowItWorksClick} className="btn-secondary">
                Voir comment ça marche
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&q=80&w=800" 
                alt="Femme entrepreneure africaine" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 glass-card shadow-xl z-20 hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ventes du jour</p>
                  <p className="text-lg font-bold text-dark">+45,000 FCFA</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-10 -left-10 glass-card shadow-xl z-20 hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 p-2 rounded-full">
                  <Sparkles className="text-accent" size={20} />
                </div>
                <p className="text-sm font-medium text-dark">Assistant IA actif</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const RegistrationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create user profile in Firestore if it doesn't exist
        await setDoc(docRef, {
          uid: user.uid,
          displayName: user.displayName || "Utilisatrice",
          email: user.email,
          role: "user",
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("La fenêtre de connexion a été fermée.");
      } else {
        setError("Une erreur est survenue lors de la connexion Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="register" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-black text-dark mb-4">
              Crée ton compte
            </h2>
            <p className="text-gray-600">
              Crée ton compte instantanément avec Google pour commencer à gérer ton business.
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 sm:p-12 rounded-[30px] shadow-[0_20px_50px_rgba(106,13,173,0.1)] border border-gray-100 text-center"
          >
            <div className="space-y-6">
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 py-4 px-6 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-primary/20 transition-all group"
              >
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuer avec Google
                  </>
                )}
              </button>

              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}

              <p className="text-xs text-gray-400 mt-4">
                En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ProfitCalculator = () => {
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [profit, setProfit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateProfit = () => {
    if (costPrice === "" || salePrice === "") {
      setError("Remplis tous les champs");
      setProfit(null);
      return;
    }

    setError(null);
    if (typeof costPrice === "number" && typeof salePrice === "number") {
      setProfit(salePrice - costPrice);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-[5px] card">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
        <DollarSign className="text-accent" size={20} /> Calcul du bénéfice
      </h3>
      <div className="space-y-0">
        <div>
          <input 
            type="number" 
            id="costPrice"
            value={costPrice}
            onChange={(e) => {
              setCostPrice(e.target.value === "" ? "" : Number(e.target.value));
              setError(null);
            }}
            placeholder="Coût du produit"
            className="w-full p-3 mb-3 rounded-[10px] border border-[#ddd] outline-none focus:border-[#FF4DA6] transition-all text-sm"
          />
        </div>
        <div>
          <input 
            type="number" 
            id="salePrice"
            value={salePrice}
            onChange={(e) => {
              setSalePrice(e.target.value === "" ? "" : Number(e.target.value));
              setError(null);
            }}
            placeholder="Prix de vente"
            className="w-full p-3 mb-3 rounded-[10px] border border-[#ddd] outline-none focus:border-[#FF4DA6] transition-all text-sm"
          />
        </div>
        <button 
          onClick={calculateProfit}
          className="bg-[#FF4DA6] text-white border-none p-3 rounded-[30px] cursor-pointer w-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_#FF4DA6] font-bold text-sm"
        >
          Calculer
        </button>

        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-xs text-center font-medium mt-2"
            >
              {error}
            </motion.p>
          )}

          {profit !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-2xl text-center ${profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <p id="profitResult" className={`text-xl font-black ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Bénéfice : {profit.toLocaleString()} FCFA
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SalesIdeaGenerator = () => {
  const [idea, setIdea] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAi, setIsAi] = useState(false);

  const staticIdeas = [
    "Fais une promo limitée 24h sur ton produit le plus vendu 🔥",
    "Publie un témoignage client avec photo 📸",
    "Fais une vidéo 'avant/après' de ton produit 🎥",
    "Montre les coulisses de ton business 👀",
    "Fais un pack promo (2 produits à prix réduit) 💰",
    "Organise un petit jeu concours sur tes réseaux sociaux 🎁",
    "Partage ton histoire : pourquoi as-tu lancé ce business ? ✨",
    "Fais un tutoriel rapide sur comment utiliser ton produit 💡",
    "Offre une petite réduction aux 5 premières clientes de la journée 🏃‍♀️",
    "Remercie publiquement une cliente fidèle aujourd'hui ❤️",
    "Demande l'avis de tes clientes sur un futur produit 🤔",
    "Fais un live shopping pour présenter tes nouveautés 📱",
    "Propose une offre 'Achetez-en 1, le 2ème à -50%' 🏷️",
    "Partage un conseil utile lié à ton domaine d'activité 🧠",
    "Crée un sentiment d'urgence : 'Plus que 3 articles en stock !' ⏳",
    "Mets en avant les bénéfices de ton produit, pas juste ses caractéristiques 🌟",
    "Collabore avec une autre entrepreneure pour un post croisé 🤝",
    "Offre la livraison gratuite pour tout achat aujourd'hui 🚚",
    "Montre comment ton produit résout un problème précis ✅",
    "Fais une liste de tes 3 produits préférés du moment ⭐",
    "Partage une citation inspirante qui te motive au quotidien 💪",
    "Explique comment tes produits sont fabriqués ou sélectionnés 🛠️",
    "Crée un sondage en story pour engager ta communauté 📊",
    "Propose un bonus gratuit (échantillon, guide PDF) pour chaque commande 🎀",
    "Fais un récapitulatif de tes meilleures ventes du mois 📈"
  ];

  const generateIdea = async () => {
    setIsGenerating(true);
    setIdea(null);
    
    // 30% chance to use AI if available, otherwise use static ideas
    const useAi = Math.random() > 0.7;
    setIsAi(useAi);

    if (useAi) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Donne-moi une idée courte et percutante (maximum 15 mots) pour aider une femme entrepreneure africaine à booster ses ventes aujourd'hui. Utilise un ton motivant et ajoute un emoji à la fin.",
        });
        
        if (response.text) {
          setIdea(response.text.replace(/"/g, '').trim());
          setIsGenerating(false);
          return;
        }
      } catch (error) {
        console.error("Erreur génération IA:", error);
      }
    }

    // Fallback or static choice
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * staticIdeas.length);
      setIdea(staticIdeas[randomIndex]);
      setIsAi(false);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="bg-white p-6 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-[5px] card">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
        <Lightbulb className="text-accent" size={20} /> Idées pour vendre
      </h3>
      <div className="space-y-4">
        <button 
          onClick={generateIdea}
          disabled={isGenerating}
          className="bg-[#FF4DA6] text-white border-none p-3 rounded-[30px] cursor-pointer w-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_10px_#FF4DA6] font-bold text-sm flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={18} />
            </motion.div>
          ) : (
            <Sparkles size={18} />
          )}
          Générer une nouvelle idée
        </button>

        <AnimatePresence mode="wait">
          {idea && (
            <motion.div 
              key={idea}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={`p-6 rounded-2xl border ${isAi ? 'bg-primary/5 border-primary/20' : 'bg-accent/5 border-accent/10'}`}
            >
              {isAi && (
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2 flex items-center gap-1">
                  <Sparkles size={10} /> Généré par IA
                </p>
              )}
              <p className="text-dark font-medium leading-relaxed text-center italic">
                "{idea}"
              </p>
            </motion.div>
          )}
          {!idea && !isGenerating && (
            <p className="text-center text-gray-400 text-sm py-4 flex flex-col items-center gap-2">
              <Zap size={24} className="text-accent/30" />
              Clique sur le bouton pour booster tes ventes !
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Dashboard = ({ userProfile }: { userProfile: UserProfile }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductSales, setNewProductSales] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!userProfile) return;

    // Listen to products
    const qProducts = query(
      collection(db, "products"),
      where("ownerId", "==", userProfile.uid),
      orderBy("createdAt", "desc")
    );
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(pList);
    });

    // Listen to orders
    const qOrders = query(
      collection(db, "orders"),
      where("ownerId", "==", userProfile.uid),
      orderBy("createdAt", "desc")
    );
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const oList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(oList);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [userProfile]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

  const stats = [
    { label: "Revenus totaux", value: `${totalRevenue.toLocaleString()} FCFA`, icon: <DollarSign className="text-green-600" />, color: "bg-green-100" },
    { label: "Produits actifs", value: products.length.toString(), icon: <Package className="text-blue-600" />, color: "bg-blue-100" },
    { label: "Commandes", value: orders.length.toString(), icon: <ShoppingCart className="text-orange-600" />, color: "bg-orange-100" },
    { label: "Clients fidèles", value: new Set(orders.map(o => o.customerName)).size.toString(), icon: <Users className="text-purple-600" />, color: "bg-purple-100" },
  ];

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    try {
      await addDoc(collection(db, "products"), {
        name: newProductName,
        price: Number(newProductPrice),
        stock: Number(newProductStock) || 0,
        salesCount: Number(newProductSales) || 0,
        ownerId: userProfile.uid,
        createdAt: serverTimestamp()
      });

      setNewProductName("");
      setNewProductPrice("");
      setNewProductStock("");
      setNewProductSales("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Es-tu sûre de vouloir supprimer ce produit ?")) return;
    try {
      await deleteDoc(doc(db, "products", productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleCreateOrder = async (product: Product) => {
    const customerName = prompt("Nom de la cliente ?") || "Cliente Anonyme";
    try {
      // Create order
      await addDoc(collection(db, "orders"), {
        customerName,
        amount: product.price,
        status: "payé",
        ownerId: userProfile.uid,
        createdAt: serverTimestamp()
      });

      // Update product sales count and stock
      await updateDoc(doc(db, "products", product.id), {
        salesCount: product.salesCount + 1,
        stock: Math.max(0, product.stock - 1)
      });
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-dark">Tableau de bord</h1>
            <p className="text-gray-500">Bienvenue, {userProfile.displayName.split(' ')[0]} ! Voici l'état de ton business aujourd'hui.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-primary transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center gap-2 py-3 px-6"
            >
              <Plus size={20} /> {showAddForm ? "Fermer" : "Nouveau produit"}
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-6">Ajouter un nouveau produit</h3>
              <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du produit</label>
                  <input 
                    type="text" 
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Ex: Savon artisanal"
                    className="w-full px-6 py-3 rounded-xl bg-gray-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prix (FCFA)</label>
                  <input 
                    type="number" 
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="Ex: 5000"
                    className="w-full px-6 py-3 rounded-xl bg-gray-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock initial</label>
                  <input 
                    type="number" 
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    placeholder="Ex: 20"
                    className="w-full px-6 py-3 rounded-xl bg-gray-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ventes initiales</label>
                  <input 
                    type="number" 
                    value={newProductSales}
                    onChange={(e) => setNewProductSales(e.target.value)}
                    placeholder="Ex: 0"
                    className="w-full px-6 py-3 rounded-xl bg-gray-50 border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-all outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary py-3">
                  Ajouter
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mb-4`}>
                {s.icon}
              </div>
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-black text-dark">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Products */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-lg">Produits populaires</h3>
                <button className="text-primary text-sm font-bold">Voir tout</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4">Produit</th>
                      <th className="px-6 py-4">Prix</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Ventes</th>
                      <th className="px-6 py-4">Total Vente</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-dark">{p.name}</td>
                        <td className="px-6 py-4 text-gray-600">{p.price.toLocaleString()} FCFA</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {p.stock} en stock
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{p.salesCount}</td>
                        <td className="px-6 py-4 font-bold text-primary">{(p.price * p.salesCount).toLocaleString()} F</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleCreateOrder(p)}
                            className="text-primary hover:text-accent font-bold text-xs"
                          >
                            Vendre
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Features Container (Integrated) */}
            <div className="features-container grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfitCalculator />
              <SalesIdeaGenerator />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Assistant IA */}
            <div className="gradient-bg p-8 rounded-3xl text-white relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 w-24 h-24 opacity-20" />
              <h3 className="text-xl font-bold mb-4 relative z-10">Assistant IA Business</h3>
              <p className="text-sm opacity-90 mb-6 relative z-10">
                "{userProfile.displayName.split(' ')[0]}, tes ventes ont augmenté cette semaine. Tu devrais poster une vidéo sur Instagram pour maintenir cette tendance !"
              </p>
              <button className="w-full bg-white text-primary py-3 rounded-xl font-bold text-sm hover:bg-light transition-colors relative z-10">
                Générer un post IA
              </button>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold mb-6">Dernières commandes</h3>
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune commande pour le moment.</p>
                ) : (
                  orders.slice(0, 5).map((order, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
                        {order.customerName[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-dark">{order.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {order.createdAt?.toDate().toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-primary">+{order.amount.toLocaleString()} F</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="text-2xl font-display font-black text-white tracking-tighter">
              FEMCASH<span className="text-accent">EXPRESS</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              La plateforme n°1 pour l'autonomisation financière des femmes entrepreneures en Afrique.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Liens utiles</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Comment ça marche</a></li>
              <li><a href="#experience" className="hover:text-white transition-colors">Expérience</a></li>
              <li><a href="#register" className="hover:text-white transition-colors">Commencer</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Légal</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-gray-400">
              <li>
                <a href="mailto:ajdeleadership@gmail.com" className="hover:text-white transition-colors">
                  ajdeleadership@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/2250170256737" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  +225 0170256737 (WhatsApp)
                </a>
              </li>
              <li>Abidjan, Côte d'Ivoire</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} FEMCASH EXPRESS. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

const AJDESection = ({ onJoinClick }: { onJoinClick: () => void }) => {
  return (
    <section id="ajde-section" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 lg:p-16 bg-light rounded-[40px] border border-accent/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full -mr-32 -mt-32" />
          
          <h2 className="text-3xl lg:text-4xl font-display font-black text-dark mb-6 relative z-10 flex items-center gap-3">
            Rejoins une communauté de femmes ambitieuses <Heart className="text-accent fill-accent" size={28} />
          </h2>

          <p className="text-lg text-gray-700 mb-8 max-w-3xl leading-relaxed relative z-10">
            L’Association des Jeunes Dames Entreprenantes (AJDE) accompagne les femmes
            entrepreneures africaines à structurer, financer et développer leur business.
          </p>

          <ul className="grid sm:grid-cols-2 gap-6 mb-12 relative z-10">
            {[
              { icon: <Users className="text-primary" size={24} />, text: "Accès à un réseau de femmes entrepreneures" },
              { icon: <GraduationCap className="text-primary" size={24} />, text: "Formations business & digital" },
              { icon: <Zap className="text-primary" size={24} />, text: "Conseils et accompagnement" },
              { icon: <Rocket className="text-primary" size={24} />, text: "Opportunités de financement et visibilité" }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-gray-700 font-medium bg-white/50 p-4 rounded-2xl border border-white">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  {item.icon}
                </div>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          <button 
            onClick={onJoinClick}
            className="btn-primary px-10 py-4 text-lg shadow-lg hover:shadow-accent/20 relative z-10"
          >
            Rejoindre l’AJDE
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'register'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const registerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Cleanup previous profile subscription if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (currentUser) {
        // Fetch user profile
        unsubProfile = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
            setView('dashboard');
          } else {
            // User is logged in but has no profile yet
            setUserProfile(null);
            setView('landing');
          }
          setIsAuthReady(true);
        }, (error) => {
          console.error("Profile fetch error:", error);
          setIsAuthReady(true); // Still set ready to show landing/error
        });
      } else {
        setUserProfile(null);
        setView('landing');
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const navigateToRegister = () => {
    setView('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCommunity = () => {
    document.getElementById("ajde-section")?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: 'smooth' });
  };

  const joinAJDE = () => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSfnarSXYDgeLvIZTYSbt9TiKwqHz7R5wYPtrEKcGMFRManrLg/viewform", "_blank");
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-accent selection:text-white">
      <Navbar onStartClick={navigateToRegister} view={view} setView={setView} userProfile={userProfile} />
      
      <main>
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Hero onStartClick={navigateToRegister} onHowItWorksClick={scrollToHowItWorks} />
              
              <section id="services">
                <div className="py-24 bg-gray-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-display font-black text-dark mb-4">
                        Tout ce dont tu as besoin pour <span className="text-accent">réussir</span>
                      </h2>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        Une interface simple et puissante conçue spécifiquement pour les défis des entrepreneures d'aujourd'hui.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[
                        { icon: <TrendingUp className="text-primary" />, title: "Gestion des ventes", desc: "Enregistrez chaque transaction en un clic et suivez votre croissance." },
                        { icon: <Package className="text-accent" />, title: "Catalogue produits", desc: "Organisez vos stocks et présentez vos produits de manière professionnelle." },
                        { icon: <PieChart className="text-primary" />, title: "Suivi des revenus", desc: "Visualisez vos profits et dépenses avec des graphiques clairs." },
                        { icon: <Sparkles className="text-accent" />, title: "Assistant IA marketing", desc: "Générez des idées de posts et des stratégies pour attirer plus de clients." },
                        { icon: <Users className="text-primary" />, title: "Gestion clients", desc: "Gardez un historique de vos clientes fidèles et relancez-les facilement." },
                        { icon: <Lightbulb className="text-accent" />, title: "Stratégies business", desc: "Accédez à des conseils d'experts adaptés au marché africain." }
                      ].map((f, i) => (
                        <motion.div
                          key={i}
                          whileInView={{ opacity: 1, y: 0 }}
                          initial={{ opacity: 0, y: 20 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="card-modern"
                        >
                          <div className="w-12 h-12 bg-light rounded-xl flex items-center justify-center mb-6">
                            {f.icon}
                          </div>
                          <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="bg-dark rounded-[40px] p-8 lg:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 blur-[100px] rounded-full" />

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      <div>
                        <h2 className="text-4xl lg:text-5xl font-display font-black text-white mb-6 leading-tight">
                          Ton business sous contrôle, <span className="text-accent">en un seul écran</span>
                        </h2>
                        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
                          Plus besoin de cahiers ou de calculatrices compliquées. FEMCASH EXPRESS centralise toutes vos données pour vous donner une vision claire de votre succès.
                        </p>
                        <button onClick={navigateToRegister} className="btn-primary">
                          Tester gratuitement
                        </button>
                      </div>

                      <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-8 shadow-2xl relative"
                      >
                        {/* Floating animation for the whole card */}
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="space-y-6"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm font-medium">Aperçu du mois</span>
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="h-8 w-8 bg-accent rounded-full shadow-[0_0_20px_rgba(255,77,166,0.5)] flex items-center justify-center" 
                            >
                              <TrendingUp size={14} className="text-white" />
                            </motion.div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 p-4 rounded-xl border border-white/5">
                              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Ventes</p>
                              <motion.p 
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                className="text-white font-bold text-lg"
                              >
                                128,500 F
                              </motion.p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl border border-white/5">
                              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Profit</p>
                              <motion.p 
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                className="text-accent font-bold text-lg"
                              >
                                +24.8%
                              </motion.p>
                            </div>
                          </div>
                          <div className="bg-white/10 p-6 rounded-xl border border-white/5">
                            <div className="flex justify-between mb-6">
                              <span className="text-white/60 text-xs font-medium">Croissance hebdo.</span>
                              <span className="text-white/30 text-[10px]">Mars 2024</span>
                            </div>
                            <div className="flex items-end gap-2 h-32">
                              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ height: 0 }}
                                  whileInView={{ height: `${h}%` }}
                                  transition={{ 
                                    duration: 1, 
                                    delay: i * 0.1,
                                    ease: "easeOut"
                                  }}
                                  className="flex-1 bg-accent/60 rounded-t-md relative group"
                                >
                                  <motion.div 
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                    className="absolute -top-1 left-0 right-0 h-1 bg-white/40 rounded-full"
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="experience" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                      <div className="relative">
                        <img 
                          src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800" 
                          alt="Entrepreneure ambitieuse" 
                          className="rounded-[40px] shadow-2xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-8 -right-8 bg-primary p-8 rounded-[30px] text-white shadow-xl hidden sm:block">
                          <p className="text-4xl font-black mb-1">98%</p>
                          <p className="text-sm opacity-80">Satisfaction client</p>
                        </div>
                      </div>
                    </div>

                    <div className="order-1 lg:order-2">
                      <h2 className="text-4xl font-display font-black text-dark mb-8">
                        Une expérience pensée pour <span className="text-primary">ton autonomie</span>
                      </h2>
                      <div className="space-y-6">
                        {[
                          "Gain de temps considérable au quotidien",
                          "Augmentation réelle des ventes par l'analyse",
                          "Interface ultra-simple, même sans être pro du digital",
                          "Pensé pour les réalités des entrepreneures africaines"
                        ].map((b, i) => (
                          <motion.div 
                            key={i}
                            whileInView={{ opacity: 1, x: 0 }}
                            initial={{ opacity: 0, x: 20 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-4"
                          >
                            <div className="mt-1 bg-light p-1 rounded-full">
                              <CheckCircle2 className="text-accent" size={24} />
                            </div>
                            <p className="text-lg text-gray-700 font-medium">{b}</p>
                          </motion.div>
                        ))}
                      </div>
                      <button onClick={scrollToCommunity} className="mt-12 btn-primary">
                        Rejoindre la communauté
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section id="how-it-works" className="py-24 bg-light/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-display font-black text-dark mb-4">
                      Comment ça <span className="text-primary">marche ?</span>
                    </h2>
                    <p className="text-gray-600">Simple, rapide et efficace. Comme ton business.</p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { num: "01", title: "Crée ton compte", desc: "Inscris-toi en 30 secondes avec ton numéro ou email." },
                      { num: "02", title: "Ajoute tes produits", desc: "Prends tes produits en photo et fixe tes prix." },
                      { num: "03", title: "Gère tes ventes", desc: "Enregistre tes commandes et encaisse tes paiements." },
                      { num: "04", title: "Développe ton business", desc: "Analyse tes stats et utilise l'IA pour vendre plus." }
                    ].map((s, i) => (
                      <div key={i} className="relative group">
                        <div className="text-6xl font-display font-black text-primary/10 absolute -top-8 left-0 group-hover:text-primary/20 transition-colors">
                          {s.num}
                        </div>
                        <div className="relative z-10 pt-4">
                          <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                          <p className="text-gray-600">{s.desc}</p>
                        </div>
                        {i < 3 && (
                          <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 text-primary/20">
                            <ChevronRight size={32} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div 
                    whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
                    viewport={{ once: true }}
                    className="gradient-bg rounded-[40px] p-12 lg:p-20 text-center text-white shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <h2 className="text-4xl lg:text-6xl font-display font-black mb-8 relative z-10">
                      Prête à transformer ton business en machine à cash ?
                    </h2>
                    <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto relative z-10">
                      Rejoins des milliers de femmes entrepreneures qui ont déjà sauté le pas vers la réussite financière.
                    </p>
                    <button onClick={navigateToRegister} className="bg-white text-primary px-10 py-4 rounded-[30px] font-bold text-lg hover:scale-105 transition-transform shadow-xl relative z-10">
                      Crée ton compte
                    </button>
                  </motion.div>
                </div>
              </section>

              <AJDESection onJoinClick={joinAJDE} />
              
              <Footer />
            </motion.div>
          ) : view === 'register' ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="pt-20"
            >
              <RegistrationForm />
              <Footer />
            </motion.div>
          ) : (
            userProfile && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Dashboard userProfile={userProfile} />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
