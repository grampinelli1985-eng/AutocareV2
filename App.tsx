// Force deploy: 2026-01-06T21:43:00-03:00
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Info, ChevronRight, Check, Trash2, Car as CarIcon, X, ShieldAlert, AlertTriangle, MapPinned, BellRing, Trophy, PartyPopper, PenTool, Eye, MapPin, CheckCircle2, Navigation, ExternalLink, ShieldCheck, Scale, FileText, Crown, Download, Lock, Printer, Fingerprint, CreditCard, Loader2, User as UserIcon, Siren, ClipboardList, CheckSquare, Square, Bell, Sparkles, Flag, Activity, Zap } from 'lucide-react';
import Layout from './components/Layout';
import VehicleCard from './components/VehicleCard';
import MaintenanceTimeline from './components/MaintenanceTimeline';
import LoginScreen from './components/LoginScreen';
import ChatBot from './components/ChatBot';
import TermsModal from './components/TermsModal';
import AddVehicleModal from './components/AddVehicleModal';
import SightingModal from './components/SightingModal';
import TheftReportModal from './components/TheftReportModal';
import { Vehicle, MaintenanceTask, ServiceRecord, TheftReport, MaintenanceMilestone, MaintenancePriority, TheftSighting, FuelLog } from './types';
import { getSmartMaintenanceAdvice, getFuelEconomyAdvice } from './services/geminiService';
import { findManualForVehicle } from './maintenanceData';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, MODELS_BY_BRAND, COMMON_ENGINES, DEFAULT_MAINTENANCE_PLAN } from './constants';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { formatPlate, calculateDistance } from './src/utils/helpers';

type Theme = 'light' | 'dark' | 'system';

interface NotificationItem {
  id: string;
  type: 'theft' | 'maintenance' | 'info';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  mapUrl?: string;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'premium'>('free');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiFuelAdvice, setAiFuelAdvice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFuelAiLoading, setIsFuelAiLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('autocare-theme') as Theme) || 'system');
  const [radarCache, setRadarCache] = useState<Record<string, { mileage: number, analysis: any }>>({});
  const [fuelAdviceCache, setFuelAdviceCache] = useState<Record<string, { mileage: number, advice: any }>>({});

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Checklist state
  const [checkedTaskIds, setCheckedTaskIds] = useState<string[]>([]);

  // Máscara de Placa
  const [plateMasked, setPlateMasked] = useState('');
  const [aiQuestionsRemaining, setAiQuestionsRemaining] = useState(5);

  // Sighting state
  const [sightingVehicleId, setSightingVehicleId] = useState<string | null>(null);
  const [isSightingValidated, setIsSightingValidated] = useState(false);
  const [sightingError, setSightingError] = useState<string | null>(null);
  const [showManualLocationInput, setShowManualLocationInput] = useState(false);
  const [reportedContent, setReportedContent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('autocare-reported-content') || '[]');
    } catch {
      return [];
    }
  });

  // Modais de Estado
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<{ task: MaintenanceTask, targetKm: number } | null>(null);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [selectedBrandInModal, setSelectedBrandInModal] = useState<string>('');
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [selectedMilestoneDetail, setSelectedMilestoneDetail] = useState<MaintenanceMilestone | null>(null);
  const [vehicleToDeleteId, setVehicleToDeleteId] = useState<string | null>(null);
  const [showHealthExplanation, setShowHealthExplanation] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showFuelAdviceModal, setShowFuelAdviceModal] = useState(false);

  // Alertas e Recuperação
  const [reportingTheftVehicleId, setReportingTheftVehicleId] = useState<string | null>(null);
  const [activeCommunityAlert, setActiveCommunityAlert] = useState<{ vehicle: Vehicle, report: TheftReport } | null>(null);
  const [vehicleToRecoverId, setVehicleToRecoverId] = useState<string | null>(null);
  const [activeRecoveryAlert, setActiveRecoveryAlert] = useState<{ vehicle: Vehicle } | null>(null);
  const [newSightingAlert, setNewSightingAlert] = useState<{ vehicle: Vehicle, mapUrl: string } | null>(null);

  const selectedVehicle = useMemo(() =>
    vehicles.find(v => v.id === selectedVehicleId) || null
    , [vehicles, selectedVehicleId]);

  const vehicleRecords = useMemo(() =>
    records.filter(r => r.vehicleId === selectedVehicleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    , [records, selectedVehicleId]);

  const vehicleFuelLogs = useMemo(() =>
    fuelLogs.filter(f => f.vehicleId === selectedVehicleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    , [fuelLogs, selectedVehicleId]);

  const averageConsumption = useMemo(() => {
    if (vehicleFuelLogs.length < 2) return null;

    // Sort ascending for calculation
    const sorted = [...vehicleFuelLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Total distance from first to last log
    const firstLog = sorted[0];
    const lastLog = sorted[sorted.length - 1];
    const totalKm = lastLog.mileage - firstLog.mileage;

    if (totalKm <= 0) return null;

    // Sum all liters EXCEPT the very first one (they correspond to the distance traveled after the first log)
    const totalLiters = sorted.slice(1).reduce((sum, log) => sum + log.liters, 0);

    if (totalLiters <= 0) return null;

    return (totalKm / totalLiters).toFixed(2);
  }, [vehicleFuelLogs]);

  const milestones = useMemo(() => {
    if (!selectedVehicle) return [];
    const manual = findManualForVehicle(selectedVehicle.brand, selectedVehicle.model, selectedVehicle.year);
    const plan = manual ? manual.maintenancePlan : DEFAULT_MAINTENANCE_PLAN;
    const warrantyLimitKm = manual ? manual.warrantyKm : 60000;
    const warrantyLimitYears = manual ? manual.warrantyYears : 3;

    const vehicleAgeYears = new Date().getFullYear() - selectedVehicle.year;

    const result: MaintenanceMilestone[] = [];
    const maxKm = Math.max(150000, selectedVehicle.currentMileage + 30000);

    for (let km = 10000; km <= maxKm; km += 10000) {
      const milestoneRecords = records.filter(r =>
        r.vehicleId === selectedVehicle.id &&
        r.mileage >= km - 2000 && r.mileage <= km + 2000
      );

      const tasksForMilestone: MaintenanceTask[] = plan.filter(p => km % p.intervalKm === 0).map((p, idx) => ({
        ...p,
        id: `m-${km}-${idx}`,
        targetKm: km
      }));

      if (tasksForMilestone.length === 0) continue;

      let status: MaintenanceMilestone['status'] = 'pending';
      if (milestoneRecords.length > 0) status = 'done';
      else if (selectedVehicle.currentMileage > km + 1000) status = 'overdue';
      else if (selectedVehicle.currentMileage < km - 2000) status = 'upcoming';

      // Uma milestone é rotulada como "Garantia" se estiver dentro dos limites teóricos do manual (KM e Anos)
      // Isso ajuda a identificar quais revisões são de concessionária no plano, mesmo que o carro seja antigo.
      const estimatedMilestoneAge = km / 10000;
      const isWarranty = km <= warrantyLimitKm && estimatedMilestoneAge <= warrantyLimitYears;

      result.push({
        km,
        label: `${km / 1000}k`,
        isWarranty,
        tasks: tasksForMilestone,
        status
      });
    }
    return result;
  }, [selectedVehicle, records]);

  const unreadNotificationsCount = useMemo(() =>
    notifications.filter(n => !n.isRead).length
    , [notifications]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
    isDark ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('autocare-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (supabase.auth) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsLoggedIn(!!session);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setIsLoggedIn(!!session);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    const initPurchases = async () => {
      if (Capacitor.getPlatform() === 'android') {
        try {
          await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
          // Note: VITE_REVENUECAT_ANDROID_API_KEY should be set in .env.local
          const apiKey = import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY;
          await Purchases.configure({ apiKey });
          console.log('RevenueCat configured successfully');
        } catch (e) {
          console.error('RevenueCat configuration error:', e);
        }
      }
    };
    initPurchases();
  }, []);

  useEffect(() => {
    // Handle Deep Links (for OAuth)
    const handleDeepLink = async () => {
      CapApp.addListener('appUrlOpen', async (data: any) => {
        const url = new URL(data.url);
        // Supabase OAuth returns data in the hash/fragment after #
        const hash = url.hash;
        if (hash && (hash.includes('access_token=') || hash.includes('type=recovery'))) {
          // Extrair parâmetros do hash manually if setSession isn't enough, 
          // but Supabase usually handles setSession with access_token and refresh_token
          const params: any = {};
          hash.substring(1).split('&').forEach(p => {
            const parts = p.split('=');
            params[parts[0]] = parts[1];
          });

          if (params.access_token && params.refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token: params.access_token,
              refresh_token: params.refresh_token
            });
            if (!error) {
              // Redireciona para dashboard se necessário ou fecha modais
              window.location.hash = ''; // Clear hash
            }
          }
        }
      });
    };

    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
      handleDeepLink();
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !session?.user) return;
      setIsLoading(true);
      const userId = session.user.id;

      try {
        // Fetch Profile
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (pError && pError.code !== 'PGRST116') {
          console.error('Error fetching profile:', pError);
        }

        if (profile) {
          setUserPlan(profile.plan as 'free' | 'premium');
          setIsTermsAccepted(profile.terms_accepted);

          // Sync AI Questions
          const today = new Date().toISOString().split('T')[0];
          const lastDate = profile.last_ai_question_date;
          if (lastDate !== today) {
            setAiQuestionsRemaining(5);
            await supabase.from('profiles').update({
              ai_questions_count: 0,
              last_ai_question_date: today
            }).eq('id', userId);
          } else {
            setAiQuestionsRemaining(Math.max(0, 5 - (profile.ai_questions_count || 0)));
          }
        } else {
          // Create profile if it doesn't exist
          await supabase.from('profiles').insert({
            id: userId,
            plan: 'free',
            terms_accepted: false,
            ai_questions_count: 0,
            last_ai_question_date: new Date().toISOString().split('T')[0]
          });
          setUserPlan('free');
          setIsTermsAccepted(false);
          setAiQuestionsRemaining(5);
        }

        // Fetch Vehicles
        const { data: vData, error: vError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('owner_id', userId);

        if (vError) throw vError;

        if (vData) {
          // Map snake_case from DB to camelCase for frontend
          const mappedVehicles = vData.map((v: any) => ({
            ...v,
            currentMileage: v.current_mileage,
            isStolen: v.is_stolen,
            theftReport: v.theft_report
          }));
          setVehicles(mappedVehicles);
          if (mappedVehicles.length > 0 && !selectedVehicleId) setSelectedVehicleId(mappedVehicles[0].id);
        }

        // Fetch Records
        const { data: rData, error: rError } = await supabase
          .from('service_records')
          .select('*')
          .eq('user_id', userId);

        if (rError) throw rError;

        if (rData) {
          const mappedRecords = rData.map((r: any) => ({
            ...r,
            vehicleId: r.vehicle_id,
            userId: r.user_id,
            taskTitle: r.task_title,
            receiptUrl: r.receipt_url
          }));
          setRecords(mappedRecords);
        }

        // Fetch Fuel Logs
        const { data: fData, error: fError } = await supabase
          .from('fuel_logs')
          .select('*')
          .eq('user_id', userId);

        if (fError) throw fError;

        if (fData) {
          const mappedFuelLogs = fData.map((f: any) => ({
            ...f,
            vehicleId: f.vehicle_id,
            userId: f.user_id,
            fuelType: f.fuel_type,
            isFullTank: f.is_full_tank
          }));
          setFuelLogs(mappedFuelLogs);
        }
      } catch (err) {
        console.error('Error synchronizing data with Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoggedIn || !session?.user) {
      setIsLoading(false);
    } else {
      fetchData();
    }
  }, [isLoggedIn, session]);

  useEffect(() => {
    if (selectedVehicle && isLoggedIn) {
      // Mileage-based caching to save tokens and prevent multiple AI calls
      const cached = radarCache[selectedVehicle.id];
      if (cached && cached.mileage === selectedVehicle.currentMileage) {
        setAiAnalysis(cached.analysis);
        return;
      }

      setIsLoading(true);
      const limit = userPlan === 'premium' ? 3 : 1;
      getSmartMaintenanceAdvice(selectedVehicle, limit).then(data => {
        setAiAnalysis(data);
        setRadarCache(prev => ({
          ...prev,
          [selectedVehicle.id]: { mileage: selectedVehicle.currentMileage, analysis: data }
        }));
        setIsLoading(false);
      });
    }
  }, [selectedVehicle?.id, selectedVehicle?.currentMileage, isLoggedIn]);

  useEffect(() => {
    if (selectedVehicle && isLoggedIn) {
      if (userPlan !== 'premium') {
        setAiFuelAdvice(null);
        return;
      }

      const cached = fuelAdviceCache[selectedVehicle.id];
      if (cached && cached.mileage === selectedVehicle.currentMileage) {
        setAiFuelAdvice(cached.advice);
        return;
      }

      setIsFuelAiLoading(true);
      getFuelEconomyAdvice(selectedVehicle, averageConsumption).then(data => {
        setAiFuelAdvice(data);
        setFuelAdviceCache(prev => ({
          ...prev,
          [selectedVehicle.id]: { mileage: selectedVehicle.currentMileage, advice: data }
        }));
        setIsFuelAiLoading(true); // Keep loading state if we want to show it? Or set to false
        setIsFuelAiLoading(false);
      });
    }
  }, [selectedVehicle?.id, selectedVehicle?.currentMileage, averageConsumption, isLoggedIn, userPlan]);

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'date' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'n' + Date.now(),
      date: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('autocare-auth', 'true');
    // userPlan will be set by fetchData from Supabase
    addNotification({
      type: 'info',
      title: 'Bem-vindo ao AutoCare IA',
      message: 'Sua garagem inteligente está configurada e pronta.'
    });
  };

  const handleLogout = async () => {
    if (supabase.auth) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setSession(null);
    // Clear user data on logout
    setVehicles([]);
    setRecords([]);
    setSelectedVehicleId(null);
    setAiAnalysis(null);
    setRadarCache({});
    setNotifications([]);
    localStorage.removeItem('autocare-auth');
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;
    setIsDeletingAccount(true);

    try {
      // 1. Delete vehicles (cascades or manual delete for safety)
      const { error: vError } = await supabase
        .from('vehicles')
        .delete()
        .eq('user_id', session.user.id);

      if (vError) throw vError;

      // 2. Delete profile
      const { error: pError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', session.user.id);

      if (pError) throw pError;

      // 3. Clear local states
      setVehicles([]);
      setRecords([]);
      setNotifications([]);

      // 3. Sign out
      if (supabase.auth) {
        await supabase.auth.signOut();
      }

      // 4. Reset auth state
      setIsLoggedIn(false);
      setSession(null);
      localStorage.removeItem('autocare-auth');
      setShowDeleteAccountConfirm(false);

      alert("Sua conta e todos os dados foram excluídos com sucesso.");
    } catch (error: any) {
      alert("Erro ao excluir conta: " + error.message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handlePlateMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlateMasked(formatPlate(e.target.value));
  };

  const handleStartVehicleAction = (adding: boolean) => {
    if (adding && userPlan === 'free' && vehicles.length >= 1) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsAddingNew(adding);

    if (adding) {
      setPlateMasked('');
    } else if (selectedVehicle) {
      setPlateMasked(selectedVehicle.plate || '');
    }

    if (!isTermsAccepted) {
      setShowTermsModal(true);
    } else {
      setSelectedBrandInModal(adding ? '' : (selectedVehicle?.brand || ''));
      setShowAddVehicleModal(true);
    }
  };

  const handleUpgradeToPremiumTrigger = () => {
    setShowSubscriptionModal(false);
    setShowPaymentSheet(true);
  };

  const checkSubscriptionStatus = async () => {
    if (!session?.user) return;

    // Force refresh profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, subscription_status')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setUserPlan(profile.plan as 'free' | 'premium');
      // If plan is premium, we can close the modal/sheet
      if (profile.plan === 'premium') {
        setShowPaymentSheet(false);
        setShowSubscriptionModal(false);
        addNotification({
          type: 'info',
          title: 'Status Atualizado',
          message: 'Sua assinatura foi confirmada com sucesso!'
        });
      }
    }
  };

  const handleConfirmPurchase = async () => {
    setIsProcessingPayment(true);
    const platform = Capacitor.getPlatform();

    try {
      if (platform === 'android') {
        // Fluxo Nativo Android com RevenueCat
        try {
          const offerings = await Purchases.getOfferings();
          if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
            // Pegamos o pacote principal (ou o primeiro disponível)
            const packageToPurchase = offerings.current.availablePackages[0];
            const { customerInfo } = await Purchases.purchasePackage({
              aPackage: packageToPurchase,
            });

            // Verifica se o entitlement Premium está ativo
            // VITE_REVENUECAT_ENTITLEMENT_ID deve ser 'Premium' no .env.local
            const entitlementId = import.meta.env.VITE_REVENUECAT_ENTITLEMENT_ID || 'Premium';
            if (customerInfo.entitlements.active[entitlementId] !== undefined) {
              if (session?.user) {
                await supabase.from('profiles').update({ plan: 'premium', subscription_status: 'active' }).eq('id', session.user.id);
                await checkSubscriptionStatus();
              }
            }
          } else {
            alert("Nenhum plano disponível para compra no momento.");
          }
        } catch (e: any) {
          if (!e.userCancelled) {
            console.error("Purchase Error:", e);
            alert("Erro ao processar compra: " + (e.message || "Tente novamente mais tarde."));
          }
        } finally {
          setIsProcessingPayment(false);
        }
      } else {
        // Web / iOS Flow (Stripe Hosted Link)
        // Replace with your actual Stripe Payment Link
        const stripeLink = "https://buy.stripe.com/test_...";
        window.open(stripeLink, '_blank');

        alert("Redirecionando para pagamento seguro via Stripe web.\n\nApós o pagamento, clique em 'Verificar Status' para atualizar seu plano.");
        setIsProcessingPayment(false);

        // Start polling or give user a button to re-check
        const interval = setInterval(() => {
          checkSubscriptionStatus();
        }, 5000);

        // Stop polling after 2 minutes
        setTimeout(() => clearInterval(interval), 120000);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
      setIsProcessingPayment(false);
    }
  };

  const handleOpenReport = () => {
    if (userPlan !== 'premium') {
      setShowSubscriptionModal(true);
      return;
    }
    setShowReportModal(true);
  };

  const printReport = async () => {
    const element = document.getElementById('printable-report');
    if (!element || isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      const originalStyle = element.getAttribute('style') || '';
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.width = '800px';
      element.style.position = 'relative';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('printable-report');
          if (el) {
            el.style.height = 'auto';
            el.style.overflow = 'visible';
          }
        }
      });

      element.setAttribute('style', originalStyle);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const contentHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = contentHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, contentHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - contentHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, contentHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`AutoCare_Relatorio_${selectedVehicle?.plate || 'Manutencao'}.pdf`);
    } catch (error) {
      console.error('Falha ao gerar PDF:', error);
      alert('Erro ao gerar o arquivo. Tente novamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const acceptTerms = async () => {
    setIsTermsAccepted(true);
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ terms_accepted: true })
        .eq('id', session.user.id);
    }
    setShowTermsModal(false);
    setSelectedBrandInModal(isAddingNew ? '' : (selectedVehicle?.brand || ''));
    setShowAddVehicleModal(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!vehicleToDeleteId || !session?.user) return;

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleToDeleteId);

    if (error) {
      alert("Erro ao excluir veículo: " + error.message);
      return;
    }

    const updatedVehicles = vehicles.filter(v => v.id !== vehicleToDeleteId);
    setVehicles(updatedVehicles);
    setRecords(prev => prev.filter(r => r.vehicleId !== vehicleToDeleteId));
    if (selectedVehicleId === vehicleToDeleteId) {
      setSelectedVehicleId(updatedVehicles.length > 0 ? updatedVehicles[0].id : null);
    }
    setVehicleToDeleteId(null);
    setShowAddVehicleModal(false);
  };

  const handleAddVehicleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    if (!isTermsAccepted) {
      setShowAddVehicleModal(false);
      setShowTermsModal(true);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const isEditing = !isAddingNew && !!selectedVehicle;

    const vehicleData: any = {
      brand: fd.get('brand') as string,
      model: fd.get('model') as string,
      year: parseInt(fd.get('year') as string),
      engine: fd.get('engine') as string,
      fuel: fd.get('fuel') as string,
      transmission: fd.get('transmission') as string,
      current_mileage: parseInt(fd.get('currentMileage') as string) || 0,
      plate: fd.get('plate') as string,
      owner_id: session.user.id
    };

    if (isEditing) {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', selectedVehicle.id)
        .select()
        .single();

      if (error) {
        alert("Erro ao atualizar veículo: " + error.message);
        return;
      }
      const mapped = {
        ...data,
        currentMileage: data.current_mileage,
        isStolen: data.is_stolen,
        theftReport: data.theft_report
      };
      setVehicles(prev => prev.map(v => v.id === selectedVehicleId ? mapped : v));
    } else {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();

      if (error) {
        alert("Erro ao adicionar veículo: " + error.message);
        return;
      }
      const mapped = {
        ...data,
        currentMileage: data.current_mileage,
        isStolen: data.is_stolen,
        theftReport: data.theft_report
      };
      setVehicles(prev => [...prev, mapped]);
      setSelectedVehicleId(mapped.id);
      addNotification({
        type: 'info',
        title: 'Novo Veículo Adicionado',
        message: `${vehicleData.brand} ${vehicleData.model} agora faz parte da sua garagem.`
      });
    }
    setShowAddVehicleModal(false);
  };

  const handleTheftReportTrigger = (vId: string) => {
    setReportingTheftVehicleId(vId);
  };

  const handleChatMessageSent = async () => {
    if (!session?.user || userPlan !== 'free') return;

    const newRemaining = Math.max(0, aiQuestionsRemaining - 1);
    setAiQuestionsRemaining(newRemaining);

    // Update DB
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_questions_count')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ ai_questions_count: (profile.ai_questions_count || 0) + 1 })
        .eq('id', session.user.id);
    }
  };

  const handleTheftReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reportingTheftVehicleId || !session?.user) return;

    const fd = new FormData(e.currentTarget);
    const targetVehicle = vehicles.find(v => v.id === reportingTheftVehicleId);

    // Capturar GPS se possível
    let lat: number | undefined;
    let lng: number | undefined;

    if (navigator.geolocation) {
      const pos = await new Promise<GeolocationPosition | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 5000 });
      });
      if (pos) {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
    }

    const report: TheftReport = {
      date: new Date().toISOString(),
      state: fd.get('state') as string,
      city: fd.get('city') as string,
      neighborhood: fd.get('neighborhood') as string,
      description: fd.get('description') as string,
      declared: fd.get('declaration') === 'on',
      latitude: lat,
      longitude: lng,
      reporterPlan: userPlan
    };

    const { error: theftError } = await supabase
      .from('vehicles')
      .update({
        is_stolen: true,
        theft_report: report,
        sightings: [],
        last_known_lat: lat,
        last_known_lng: lng
      })
      .eq('id', reportingTheftVehicleId);

    if (theftError) {
      alert("Erro ao registrar roubo: " + theftError.message);
      return;
    }

    setVehicles(prev => prev.map(v =>
      v.id === reportingTheftVehicleId ? {
        ...v,
        isStolen: true,
        theftReport: report,
        sightings: [],
        lastKnownLat: lat,
        lastKnownLng: lng
      } : v
    ));

    setReportingTheftVehicleId(null);
    if (targetVehicle) {
      setActiveCommunityAlert({ vehicle: targetVehicle, report: report });
      addNotification({
        type: 'theft',
        title: 'Alerta de Roubo Ativo',
        message: `O alerta de roubo para o seu ${targetVehicle.model} foi disparado para a comunidade.`
      });
    }
  };

  const handleReportSighting = (sightingId: string) => {
    const updatedReported = [...reportedContent, sightingId];
    setReportedContent(updatedReported);
    localStorage.setItem('autocare-reported-content', JSON.stringify(updatedReported));
    alert("Obrigado por sua denúncia. Para sua segurança e conformidade com as diretrizes da comunidade, este conteúdo foi removido da sua visualização e nossa equipe irá analisá-lo em breve.");
  };

  const handlePlateValidation = (val: string) => {
    if (!sightingVehicleId) return;
    const targetVehicle = vehicles.find(v => v.id === sightingVehicleId);
    if (val.length === 2) {
      if (targetVehicle?.plate?.slice(-2) === val) {
        setIsSightingValidated(true);
        setSightingError(null);
      } else {
        setIsSightingValidated(false);
        setSightingError("Placa não confere com o veiculo roubado.");
      }
    } else {
      setIsSightingValidated(false);
      setSightingError(null);
    }
  };

  const handleSightingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sightingVehicleId || !isSightingValidated) return;

    const targetVehicle = vehicles.find(v => v.id === sightingVehicleId);
    if (!targetVehicle) return;

    const fd = new FormData(e.currentTarget);
    const manualLocation = fd.get('manualLocation') as string;

    const finalizeSighting = async (locationText: string, mapUrl?: string) => {
      const newSighting: TheftSighting = {
        id: 's' + Date.now(),
        date: new Date().toISOString(),
        location: locationText,
        description: mapUrl ? `Visto via coordenadas GPS em tempo real.` : `Localização informada manualmente: ${locationText}`,
        mapUrl: mapUrl,
      };

      const targetVehicle = vehicles.find(v => v.id === sightingVehicleId);
      if (!targetVehicle) return;

      const updatedSightings = [newSighting, ...(targetVehicle.sightings || [])];

      const { error } = await supabase
        .from('vehicles')
        .update({ sightings: updatedSightings })
        .eq('id', sightingVehicleId);

      if (error) {
        alert("Erro ao registrar avistamento: " + error.message);
        return;
      }

      setVehicles(prev => prev.map(v =>
        v.id === sightingVehicleId ? { ...v, sightings: updatedSightings } : v
      ));

      setSightingVehicleId(null);
      setIsSightingValidated(false);
      setShowManualLocationInput(false);
      setNewSightingAlert({ vehicle: targetVehicle, mapUrl: mapUrl || '' });
      addNotification({
        type: 'theft',
        title: 'Veículo Avistado!',
        message: `Um membro da comunidade avistou seu ${targetVehicle.model}. ${mapUrl ? 'Confira o mapa agora.' : `Local: ${locationText}`}`,
        mapUrl: mapUrl
      });
    };

    if (manualLocation) {
      finalizeSighting(manualLocation);
      return;
    }

    if (!window.isSecureContext) {
      setShowManualLocationInput(true);
      alert("⚠️ GPS Indisponível: O navegador exige uma conexão segura (HTTPS ou Localhost) para usar o GPS. \n\nComo você está acessando via IP de rede, por favor, informe o local manualmente abaixo.");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        finalizeSighting(`GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, mapsUrl);
      }, (error) => {
        console.warn("GPS Error:", error);
        setShowManualLocationInput(true);
        if (error.code === 1) { // PERMISSION_DENIED
          alert("📍 Permissão Negada: O acesso à localização foi bloqueado. \n\nPara reativar, clique no ícone de cadeado/configurações ao lado da URL do navegador e limpe as permissões de localização.");
        } else if (error.code === 3) { // TIMEOUT
          alert("⏳ Tempo Esgotado: Não foi possível obter sua posição a tempo. Tente novamente ou informe manualmente.");
        } else {
          alert("❌ Erro de GPS: Não foi possível obter sua localização automática. Por favor, informe o local manualmente.");
        }
      }, {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000
      });
    } else {
      setShowManualLocationInput(true);
      alert("Seu navegador não suporta geolocalização. Por favor, informe o local manualmente abaixo.");
    }
  };

  const confirmRecovery = async () => {
    if (!vehicleToRecoverId) return;

    const { error } = await supabase
      .from('vehicles')
      .update({
        is_stolen: false,
        theft_report: null,
        sightings: []
      })
      .eq('id', vehicleToRecoverId);

    if (error) {
      alert("Erro ao confirmar recuperação: " + error.message);
      return;
    }

    const recoveredVehicle = vehicles.find(v => v.id === vehicleToRecoverId);
    setVehicles(prev => prev.map(v =>
      v.id === vehicleToRecoverId ? { ...v, isStolen: false, theftReport: undefined, sightings: [] } : v
    ));
    setVehicleToRecoverId(null);
    if (recoveredVehicle) {
      setActiveRecoveryAlert({ vehicle: recoveredVehicle });
      addNotification({
        type: 'info',
        title: 'Veículo Recuperado',
        message: `Ficamos muito felizes em saber que seu ${recoveredVehicle.brand} ${recoveredVehicle.model} está de volta!`
      });
    }
  };

  const saveServiceRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!selectedVehicleId || !taskToComplete || !session?.user) return;

    const mileage = parseInt(fd.get('mileage') as string);
    const newRecordData: any = {
      vehicle_id: selectedVehicleId,
      user_id: session.user.id,
      task_title: (fd.get('taskTitle') as string) || taskToComplete.task.title,
      date: fd.get('date') as string,
      mileage,
      cost: parseFloat(fd.get('cost') as string) || 0,
      notes: fd.get('notes') as string,
    };

    const { data: record, error: rError } = await supabase
      .from('service_records')
      .insert(newRecordData)
      .select()
      .single();

    if (rError) {
      alert("Erro ao salvar registro: " + rError.message);
      return;
    }

    const mappedRecord = {
      ...record,
      vehicleId: record.vehicle_id,
      userId: record.user_id,
      taskTitle: record.task_title
    };
    setRecords(prev => [...prev, mappedRecord]);

    if (mileage > (selectedVehicle?.currentMileage || 0)) {
      const { error: vError } = await supabase
        .from('vehicles')
        .update({ current_mileage: mileage })
        .eq('id', selectedVehicleId);

      if (!vError) {
        setVehicles(prev => prev.map(v => v.id === selectedVehicleId ? { ...v, currentMileage: mileage } : v));
      }
    }

    setTaskToComplete(null);
    addNotification({
      type: 'maintenance',
      title: 'Manutenção Concluída',
      message: `O serviço "${mappedRecord.taskTitle}" foi registrado em ${mileage} KM.`
    });
  };

  const toggleTaskChecked = (taskId: string) => {
    setCheckedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleOpenMilestoneDetail = (m: MaintenanceMilestone) => {
    setSelectedMilestoneDetail(m);
    setCheckedTaskIds(m.tasks.map(t => t.id));
  };

  const handleFuelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !selectedVehicleId) return;

    const fd = new FormData(e.currentTarget);
    const mileage = parseInt(fd.get('mileage') as string);
    const liters = parseFloat(fd.get('liters') as string);
    const cost = parseFloat(fd.get('cost') as string) || 0;

    const newFuelLog: any = {
      vehicle_id: selectedVehicleId,
      user_id: session.user.id,
      date: fd.get('date') as string,
      mileage,
      liters,
      cost,
      fuel_type: fd.get('fuelType') as string,
      is_full_tank: fd.get('isFullTank') === 'on'
    };

    const { data: log, error } = await supabase
      .from('fuel_logs')
      .insert(newFuelLog)
      .select()
      .single();

    if (error) {
      alert("Erro ao salvar abastecimento: " + error.message);
      return;
    }

    const mappedLog = {
      ...log,
      vehicleId: log.vehicle_id,
      userId: log.user_id,
      fuelType: log.fuel_type,
      isFullTank: log.is_full_tank
    };

    setFuelLogs(prev => [...prev, mappedLog]);
    setShowFuelModal(false);

    // Update vehicle mileage if higher
    if (mileage > (selectedVehicle?.currentMileage || 0)) {
      await supabase
        .from('vehicles')
        .update({ current_mileage: mileage })
        .eq('id', selectedVehicleId);
      setVehicles(prev => prev.map(v => v.id === selectedVehicleId ? { ...v, currentMileage: mileage } : v));
    }

    addNotification({
      type: 'info',
      title: 'Abastecimento Registrado',
      message: `Média calculada automaticamente no painel.`
    });
  };

  const handleResetFuel = async () => {
    if (!selectedVehicleId) return;
    if (!window.confirm("Deseja realmente resetar o histórico de abastecimentos deste veículo? Isso limpará o cálculo de média.")) return;

    const { error } = await supabase
      .from('fuel_logs')
      .delete()
      .eq('vehicle_id', selectedVehicleId);

    if (error) {
      alert("Erro ao resetar histórico: " + error.message);
      return;
    }

    setFuelLogs(prev => prev.filter(f => f.vehicleId !== selectedVehicleId));
    addNotification({
      type: 'info',
      title: 'Histórico Resetado',
      message: 'O cálculo de consumo foi limpo com sucesso.'
    });
  };

  const handleRegisterFromChecklist = () => {
    if (!selectedMilestoneDetail) return;
    const selectedTasks = selectedMilestoneDetail.tasks.filter(t => checkedTaskIds.includes(t.id));
    if (selectedTasks.length === 0) {
      alert("Selecione pelo menos um item para registrar.");
      return;
    }

    const combinedTitle = selectedTasks.map(t => t.title).join(', ');

    setTaskToComplete({
      task: {
        ...selectedTasks[0],
        id: 'bulk-' + Date.now(),
        title: combinedTitle,
        description: 'Serviços realizados de acordo com o checklist do marco.'
      },
      targetKm: selectedMilestoneDetail.km
    });
    setSelectedMilestoneDetail(null);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'chat') {
      setIsChatOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      onNotificationClick={handleOpenNotifications}
      hasNotifications={unreadNotificationsCount > 0}
      userPlan={userPlan}
    >
      <div className="relative pb-10">


        {/* POP-UP ALERTA COMUNITÁRIO (DINÂMICO PELO PLANO DO EMISSOR) */}
        {activeCommunityAlert && (activeCommunityAlert.report.reporterPlan === 'premium' || (
          // Se o emissor for Free, só mostrar se o receptor estiver num raio de 50km
          !activeCommunityAlert.report.latitude || !vehicles[0]?.lastKnownLat ? true :
            calculateDistance(
              vehicles[0]?.lastKnownLat || 0,
              vehicles[0]?.lastKnownLng || 0,
              activeCommunityAlert.report.latitude,
              activeCommunityAlert.report.longitude
            ) <= 50
        )) && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-red-600/20 backdrop-blur-md animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-red-600 text-center space-y-6 animate-in zoom-in-95">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-25" />
                  <div className="relative bg-red-600 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
                    <Siren size={48} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-red-600 uppercase tracking-tighter">Alerta de Roubo!</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Atenção Comunidade AutoCare</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <p className="text-lg font-black text-slate-800 dark:text-white uppercase">{activeCommunityAlert.vehicle.brand} {activeCommunityAlert.vehicle.model}</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="bg-slate-800 text-white px-3 py-1 rounded-lg font-mono text-sm tracking-widest">{activeCommunityAlert.vehicle.plate}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold mt-3 uppercase tracking-wider italic">Visto por último em: {activeCommunityAlert.report.city} - {activeCommunityAlert.report.state}</p>

                  {activeCommunityAlert.report.description && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/50 text-left">
                      <p className="text-[9px] text-red-600 dark:text-red-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Info size={10} /> Detalhes da Ocorrência:
                      </p>
                      <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic">
                        "{activeCommunityAlert.report.description}"
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Fique atento! Se localizar este veículo, informe um avistamento no mapa para ajudar o proprietário.</p>
                <button
                  onClick={() => setActiveCommunityAlert(null)}
                  className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95"
                >
                  Entendido, ficarei de olho
                </button>
              </div>
            </div>
          )}

        {/* MODAL CENTRO DE NOTIFICAÇÕES */}
        {showNotifications && (
          <div className="fixed inset-0 z-[900] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] shadow-2xl flex flex-col max-h-[75vh] border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"><Bell size={18} /></div>
                  <h2 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight">Centro de Alertas</h2>
                </div>
                <button onClick={() => setShowNotifications(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex gap-4 transition-all hover:bg-white dark:hover:bg-slate-800">
                      <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${n.type === 'theft' ? 'bg-red-500 animate-pulse' : n.type === 'maintenance' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-none tracking-tight">{n.title}</p>
                          {n.mapUrl && (
                            <a
                              href={n.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-tighter hover:underline"
                            >
                              <ExternalLink size={10} />
                              Ver no Mapa
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-snug">{n.message}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-1">{new Date(n.date).toLocaleDateString()} {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <Bell size={48} className="text-slate-200 dark:text-slate-800 mx-auto" />
                    <p className="text-sm font-bold text-slate-400">Nenhuma notificação por enquanto.</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowNotifications(false)} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">Fechar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL RELATÓRIO PDF (PREMIUM) */}
        {showReportModal && selectedVehicle && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 no-print">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl"><FileText size={20} /></div>
                  <h2 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight">Relatório de Manutenção</h2>
                </div>
                <button onClick={() => setShowReportModal(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              <div id="printable-report" className="flex-1 overflow-y-auto p-12 space-y-12 bg-white text-slate-900 pdf-content-area">
                <div className="h-4 bg-indigo-600 rounded-t-lg -mx-12 -mt-12 mb-8"></div>
                <div className="flex items-center justify-between border-b-8 border-indigo-600 pb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                      <CarIcon size={56} />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black text-indigo-600 tracking-tighter uppercase leading-none">AutoCare IA</h1>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Gestão Inteligente Automotiva</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Documento Oficial</p>
                    <p className="text-sm font-black text-slate-800">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 pt-4">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-indigo-600 border-b-2 border-indigo-100 pb-1 tracking-widest">Dados do Proprietário</h4>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-2xl text-slate-400"><UserIcon size={24} /></div>
                      <div>
                        <p className="text-base font-black text-slate-800">Usuário AutoCare</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Assinante Premium</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-indigo-600 border-b-2 border-indigo-100 pb-1 tracking-widest">Informações do Veículo</h4>
                    <div>
                      <p className="text-xl font-black text-slate-800 flagship leading-tight uppercase">{selectedVehicle.brand} {selectedVehicle.model}</p>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{selectedVehicle.year} • {selectedVehicle.engine} • PLACA {selectedVehicle.plate}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[32px] flex justify-around items-center border-2 border-slate-100 shadow-sm">
                  <div className="text-center">
                    <p className="text-3xl font-black text-indigo-600">{selectedVehicle.currentMileage.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">KM Atual Registrado</p>
                  </div>
                  <div className="w-px h-12 bg-slate-200" />
                  <div className="text-center">
                    <p className="text-3xl font-black text-slate-800">{vehicleRecords.length}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Serviços Históricos</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl">
                    <ClipboardList size={20} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">Descrição Completa dos Serviços e Peças</h4>
                  </div>

                  {vehicleRecords.length > 0 ? (
                    <div className="space-y-10">
                      {vehicleRecords.map(record => (
                        <div key={record.id} className="relative border-l-8 border-indigo-600 pl-8 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{record.taskTitle}</p>
                              <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1">Realizado em {new Date(record.date).toLocaleDateString('pt-BR')} • {record.mileage.toLocaleString()} KM</p>
                            </div>
                            <div className="text-right bg-indigo-50 px-4 py-2 rounded-xl">
                              <p className="text-sm font-black text-indigo-700 tracking-tight">R$ {record.cost.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                              <PenTool size={12} className="text-indigo-600" /> Descrição do Serviço e Detalhamento de Peças:
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap italic">
                              {record.notes || "Nenhum detalhe adicional informado para este registro."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center text-slate-300 italic text-base font-medium">Não há registros de serviços cadastrados para este veículo.</div>
                  )}
                </div>

                <div className="pt-12 mt-12 border-t-4 border-slate-100 space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">Certificação AutoCare IA</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed max-w-[400px] font-medium italic">Documento autogerado via plataforma AutoCare. Este registro é mantido em nuvem para fins de histórico de manutenção preventiva.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black uppercase text-slate-900 tracking-widest">ID de Autenticação</p>
                      <p className="text-[10px] font-mono text-slate-300 uppercase tracking-[0.2em] mt-1">{selectedVehicle.plate}-{Date.now()}</p>
                    </div>
                  </div>
                  <div className="text-center bg-slate-900 text-white py-2 rounded-xl">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em]">Garantia de Organização para seu Veículo</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-4 no-print">
                <button
                  onClick={printReport}
                  disabled={isGeneratingPdf}
                  className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-70 transition-all"
                >
                  {isGeneratingPdf ? (
                    <><Loader2 size={20} className="animate-spin" /> Gerando Documento...</>
                  ) : (
                    <><Download size={20} /> Baixar Relatório PDF</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PLANO PREMIUM */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-lg animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 border border-amber-100 dark:border-amber-900/30">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-full mx-auto flex items-center justify-center">
                  <Crown size={32} className="text-amber-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">AutoCare IA Premium</h2>
                <p className="text-xs text-slate-500 font-bold">Libere todo o potencial da sua garagem</p>
                <p className="text-xs text-slate-500 font-bold">Cancelamento disponível pela Google Play.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
                  <PlusCircle size={20} className="text-indigo-600" />
                  <div>
                    <p className="text-sm font-bold">Veículos Ilimitados</p>
                    <p className="text-[10px] text-slate-500">Cadastre todos os carros da família.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
                  <Sparkles size={20} className="text-indigo-600" />
                  <div>
                    <p className="text-sm font-bold">IA Chat Especialista</p>
                    <p className="text-[10px] text-slate-500">Dúvidas mecânicas respondidas por IA sem limites diários..</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
                  <FileText size={20} className="text-indigo-600" />
                  <div>
                    <p className="text-sm font-bold">Relatórios em PDF</p>
                    <p className="text-[10px] text-slate-500">Gere histórico pronto para impressão.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
                  <Activity size={20} className="text-indigo-600" />
                  <div>
                    <p className="text-sm font-bold">Dicas de Economia IA</p>
                    <p className="text-[10px] text-slate-500">Radar inteligente para reduzir gastos com combustível.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
                  <ShieldAlert size={20} className="text-red-600" />
                  <div>
                    <p className="text-sm font-bold">Alerta de Roubo</p>
                    <p className="text-[10px] text-slate-500">Rede ampliada de proteção comunitária ativa.</p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-3xl font-black text-slate-800 dark:text-white">R$ 15,99 <span className="text-sm font-bold text-slate-400">/mês</span></p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleUpgradeToPremiumTrigger}
                  className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black active:scale-95 shadow-xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                  Assinar Agora
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                >
                  Continuar com Plano Free
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIMULAÇÃO DE PAGAMENTO LOJA (STORE SHEET) */}
        {showPaymentSheet && (
          <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <CarIcon size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black dark:text-white">AutoCare IA Premium</h3>
                  <p className="text-sm text-slate-500 font-medium italic">Assinatura Mensal</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xl font-black text-slate-800 dark:text-white">R$ 15,99</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">por mês</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conta</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{session?.user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plataforma</span>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-indigo-600" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {Capacitor.getPlatform() === 'android' ? 'Google Play Store' : 'Pagamento Seguro Web'}
                    </span>
                  </div>
                </div>
              </div>

              {isProcessingPayment ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 size={40} className="text-indigo-600 animate-spin" />
                  <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Processando Compra...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleConfirmPurchase}
                    className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
                  >
                    <Fingerprint size={24} />
                    <span className="uppercase text-xs tracking-widest">
                      {Capacitor.getPlatform() === 'android' ? 'Assinar com Google Play' : 'Ir para Pagamento Seguro'}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowPaymentSheet(false)}
                    className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                  >
                    Cancelar Transação
                  </button>
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-center mt-6 leading-relaxed">
                Cobrança recorrente. Você pode cancelar a qualquer momento nas configurações da sua conta na loja de aplicativos.
              </p>
            </div>
          </div>
        )}

        {/* MODAL TERMOS E CONDIÇÕES JURÍDICOS */}
        <TermsModal
          isOpen={showTermsModal}
          onAccept={acceptTerms}
          onClose={() => setShowTermsModal(false)}
        />

        <AddVehicleModal
          isOpen={showAddVehicleModal && isTermsAccepted}
          isAddingNew={isAddingNew}
          selectedVehicle={selectedVehicle}
          plateMasked={plateMasked}
          selectedBrandInModal={selectedBrandInModal}
          onClose={() => setShowAddVehicleModal(false)}
          onSubmit={handleAddVehicleSubmit}
          onPlateMask={handlePlateMask}
          onBrandChange={setSelectedBrandInModal}
        />

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-tab-fade">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Meu Veículo</h2>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${userPlan === 'premium' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-500'}`}>Plano {userPlan}</span>
              </div>
              <button onClick={() => handleStartVehicleAction(true)} className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl active:scale-90">
                <PlusCircle size={18} />
              </button>
            </div>

            {isLoading && vehicles.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <Loader2 size={48} className="text-indigo-600 animate-spin mx-auto" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Sincronizando sua garagem...</p>
              </div>
            ) : vehicles.length > 0 && selectedVehicle ? (
              <>
                <div className="space-y-3">
                  {vehicles.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {vehicles.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVehicleId(v.id)}
                          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${selectedVehicleId === v.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                        >
                          {v.model}
                        </button>
                      ))}
                    </div>
                  )}
                  <VehicleCard
                    vehicle={selectedVehicle}
                    score={aiAnalysis?.score || 85}
                    onDelete={(id) => setVehicleToDeleteId(id)}
                    onShowHealthInfo={() => setShowHealthExplanation(true)}
                    isLoading={isLoading}
                  />

                  {/* CARD DE CONSUMO */}
                  <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                          <Activity size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Consumo Real</p>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none">
                            {averageConsumption ? `${averageConsumption} km/L` : '--- km/L'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Média Histórica</p>
                            {averageConsumption && (
                              <button
                                onClick={handleResetFuel}
                                className="text-[8px] text-red-400 font-black uppercase hover:text-red-600 transition-colors"
                              >
                                (Resetar)
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Radar de Consumo IA Header */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Radar de Consumo IA</span>
                          <div className="bg-indigo-100 dark:bg-indigo-500/20 p-1 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Zap size={12} />
                          </div>
                        </div>
                        {userPlan === 'premium' && <span className="bg-amber-400 text-[7px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Premium</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowFuelModal(true)}
                        className="bg-emerald-600 text-white px-4 py-3.5 rounded-2xl font-black text-[10px] active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        <PlusCircle size={14} /> Abastecer
                      </button>

                      {userPlan === 'free' ? (
                        <button
                          onClick={() => setShowSubscriptionModal(true)}
                          className="w-full bg-indigo-600 text-[9px] font-black text-white py-3.5 rounded-2xl uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all text-center"
                        >
                          Unlock Premium
                        </button>
                      ) : (
                        <div className="w-full">
                          {isFuelAiLoading && !aiFuelAdvice ? (
                            <div className="h-full bg-slate-100 dark:bg-white/5 animate-pulse rounded-2xl" />
                          ) : aiFuelAdvice?.tips ? (
                            <button
                              onClick={() => setShowFuelAdviceModal(true)}
                              className="w-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-500/20"
                            >
                              <Activity size={14} /> Dicas IA
                            </button>
                          ) : (
                            <div className="h-full bg-slate-50 dark:bg-white/5 flex items-center justify-center rounded-2xl px-2">
                              <p className="text-[8px] text-slate-400 italic text-center leading-tight">Mais dados p/ IA</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                  <h3 className="text-lg font-bold">Radar Preventivo IA</h3>
                  <div className="space-y-3 mt-4">
                    {isLoading && !aiAnalysis ? <div className="h-20 bg-white/10 animate-pulse rounded-2xl" /> :
                      aiAnalysis?.advices?.slice(0, userPlan === 'free' ? 1 : undefined).map((adv: any, i: number) => (
                        <div key={i} className="flex gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                          <div className={`shrink-0 w-1.5 h-full rounded-full ${adv.urgency === 'high' ? 'bg-orange-400' : 'bg-indigo-300'}`} />
                          <div><h4 className="text-xs font-bold uppercase text-indigo-200">{adv.title}</h4><p className="text-sm text-white/90 leading-tight">{adv.content}</p></div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center space-y-4 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[40px] flex items-center justify-center mx-auto shadow-inner">
                  <CarIcon size={48} className="text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-800 dark:text-white font-bold">Sua garagem está vazia</p>
                  <p className="text-slate-500 text-xs px-10">Cadastre seu veículo para começar a cuidar da saúde dele.</p>
                </div>
                <button
                  onClick={() => handleStartVehicleAction(true)}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold active:scale-95 shadow-lg shadow-indigo-200"
                >
                  Adicionar Carro
                </button>
              </div>
            )}
          </div>
        )}

        {/* MAINTENANCE TAB */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6 animate-tab-slide-right">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Timeline</h2>
              <button
                onClick={handleOpenReport}
                className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl font-bold text-xs active:scale-95 transition-all"
              >
                <Download size={16} /> Relatório PDF
                {userPlan === 'free' && <Lock size={12} />}
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <MaintenanceTimeline milestones={milestones} onCompleteTask={(task, km) => setTaskToComplete({ task, targetKm: km })} onViewDetail={(m) => handleOpenMilestoneDetail(m)} />
            </div>
          </div>
        )}

        {/* THEFT TAB */}
        {activeTab === 'theft' && (
          <div className="space-y-6 animate-tab-fade">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Comunidade</h2>
              <p className="text-xs text-slate-500 font-medium">Alertas ativos e rede de proteção.</p>
            </div>

            <div className="space-y-4">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className={`bg-white dark:bg-slate-900 p-5 rounded-[32px] border transition-all shadow-sm ${vehicle.isStolen ? 'border-red-500 bg-red-50/5' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${vehicle.isStolen ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <CarIcon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{vehicle.brand} {vehicle.model}</h4>
                        <p className="text-[10px] font-mono text-slate-500 uppercase">{vehicle.plate || 'SEM PLACA'}</p>
                        {vehicle.isStolen && <span className="text-[9px] font-black text-red-600 uppercase flex items-center gap-1 mt-1"><AlertTriangle size={10} /> VEÍCULO PROCURADO</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {vehicle.isStolen && (
                        <button onClick={() => setSightingVehicleId(vehicle.id)} className="bg-indigo-600 text-white p-3 rounded-2xl active:scale-90 shadow-md" title="Relatar Avistamento"><Eye size={20} /></button>
                      )}
                      {!vehicle.isStolen ? (
                        <button onClick={() => handleTheftReportTrigger(vehicle.id)} className="bg-red-50 text-red-600 p-3 rounded-2xl hover:bg-red-600 hover:text-white active:scale-90 transition-all shadow-sm" title="Emitir Alerta"><ShieldAlert size={20} /></button>
                      ) : (
                        <button onClick={() => setVehicleToRecoverId(vehicle.id)} className="bg-emerald-600 text-white p-3 rounded-2xl active:scale-90 shadow-md" title="Confirmar Recuperação"><Trophy size={20} /></button>
                      )}
                    </div>
                  </div>

                  {vehicle.isStolen && vehicle.sightings && vehicle.sightings.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <h5 className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1"><MapPinned size={10} /> Avistamentos Recentes ({vehicle.sightings.length})</h5>
                      {vehicle.sightings
                        .filter(s => !reportedContent.includes(s.id))
                        .slice(0, 5)
                        .map(s => (
                          <div key={s.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-[10px] border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold flex items-center gap-1"><MapPin size={8} className="text-red-500" /> {s.location}</span>
                              <div className="flex items-center gap-1">
                                {s.mapUrl && (
                                  <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md hover:bg-indigo-600 hover:text-white transition-colors">
                                    <Navigation size={8} /> MAPA
                                  </a>
                                )}
                                <button
                                  onClick={() => handleReportSighting(s.id)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                  title="Denunciar e bloquear conteúdo"
                                >
                                  <Flag size={8} />
                                </button>
                                <span className="text-slate-400 font-bold ml-1">{new Date(s.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-tight">{s.description}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-tab-slide-bottom">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-slate-800 rounded-[32px] mx-auto mb-4 flex items-center justify-center font-black text-indigo-600 text-2xl shadow-xl">U</div>
              <h3 className="font-bold text-lg dark:text-white">{session?.user?.email || 'Motorista AutoCare'}</h3>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${userPlan === 'free' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                Plano {userPlan}
              </span>
            </div>

            {userPlan === 'free' && (
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-[32px] text-white shadow-xl shadow-amber-200 dark:shadow-none space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-black uppercase tracking-tight">Upgrade Premium</h4>
                  <Crown size={24} />
                </div>
                <p className="text-xs font-bold leading-relaxed opacity-90">Libere IA especialista, alertas comunitários de roubo, relatórios em PDF e veículos ilimitados por apenas R$ 15,99/mês.</p>
                <button onClick={() => setShowSubscriptionModal(true)} className="w-full bg-white text-amber-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95">Quero ser Premium</button>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} /> Aparência</h4>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${theme === t
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-500'
                      }`}
                  >
                    <div className="mb-1">
                      {t === 'light' && <Sparkles size={18} />}
                      {t === 'dark' && <Eye size={18} />}
                      {t === 'system' && <CarIcon size={18} />}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter">
                      {t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Auto'}
                    </span>
                  </button>
                ))}
              </div>

              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-4"><FileText size={14} /> Documentação</h4>
              <button onClick={() => setShowTermsModal(true)} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group active:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  <span className="text-sm font-bold">Termos de Uso e Isenção</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              <a
                href="https://sites.google.com/view/politicadeprivacidadeautocare/in%C3%ADcio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group active:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-indigo-600" />
                  <span className="text-sm font-bold">Política de Privacidade</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
            </div>

            <div className="space-y-2">
              <button onClick={() => handleStartVehicleAction(false)} className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"><div className="flex items-center gap-4"><CarIcon className="text-indigo-600" /><div className="text-left"><p className="font-bold text-sm">Gerenciar Veículo</p><p className="text-[10px] text-slate-500">Alterar placa ou dados.</p></div></div><ChevronRight size={18} className="text-slate-300" /></button>
              <button onClick={() => setVehicleToDeleteId(selectedVehicleId)} className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"><div className="flex items-center gap-4"><Trash2 className="text-red-500" /><div className="text-left"><p className="font-bold text-sm text-red-500">Remover Carro</p><p className="text-[10px] text-slate-500">Apagar todo o histórico.</p></div></div><ChevronRight size={18} className="text-slate-300" /></button>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 px-2">Gestão de Dados</p>
                <button
                  onClick={() => setShowDeleteAccountConfirm(true)}
                  className="w-full flex items-center justify-between p-5 bg-red-50/30 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 group hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Trash2 className="text-red-600" />
                    <div className="text-left">
                      <p className="font-bold text-sm text-red-600">Excluir Minha Conta</p>
                      <p className="text-[10px] text-red-400">Apagar perfil e todos os dados permanentemente.</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-red-300" />
                </button>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full py-4 text-slate-500 font-bold bg-slate-100 dark:bg-slate-800/50 rounded-2xl active:scale-95 transition-all mt-4">Sair da Garagem</button>
          </div>
        )}

        {/* MODAIS DE APOIO */}
        <SightingModal
          isOpen={!!sightingVehicleId}
          onClose={() => { setSightingVehicleId(null); setSightingError(null); setIsSightingValidated(false); }}
          onSubmit={handleSightingSubmit}
          onPlateValidation={handlePlateValidation}
          sightingError={sightingError}
          showManualLocationInput={showManualLocationInput}
          isSightingValidated={isSightingValidated}
        />

        {activeRecoveryAlert && (
          <div className="fixed inset-0 z-[450] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in zoom-in-95">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-emerald-500 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mx-auto flex items-center justify-center">
                <PartyPopper size={40} className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase">Excelente Notícia!</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">O veículo <strong>{activeRecoveryAlert.vehicle.brand} {activeRecoveryAlert.vehicle.model}</strong> foi recuperado com sucesso e o alerta de roubo foi desativado na comunidade.</p>
              <button onClick={() => setActiveRecoveryAlert(null)} className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black uppercase text-xs shadow-xl active:scale-95">Continuar</button>
            </div>
          </div>
        )}

        {selectedMilestoneDetail && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10 shrink-0">
                <div className="flex flex-col">
                  <h3 className="font-bold text-slate-800 dark:text-white">Checklist {selectedMilestoneDetail.km.toLocaleString()} km</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Selecione os serviços realizados</p>
                </div>
                <button onClick={() => setSelectedMilestoneDetail(null)} className="p-1 text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {selectedMilestoneDetail.tasks.map((task) => {
                  const isChecked = checkedTaskIds.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskChecked(task.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${isChecked ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-800'}`}
                    >
                      <div className={`mt-0.5 shrink-0 ${isChecked ? 'text-indigo-600' : 'text-slate-300'}`}>
                        {isChecked ? <CheckSquare size={24} /> : <Square size={24} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${isChecked ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-white'}`}>{task.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{task.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 shrink-0">
                <button
                  onClick={handleRegisterFromChecklist}
                  className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <PenTool size={18} /> Registrar Serviços ({checkedTaskIds.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {taskToComplete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <PenTool size={20} className="text-indigo-600" /> Registro de Serviço
                </h3>
                <button onClick={() => setTaskToComplete(null)} className="p-1 text-slate-400"><X size={20} /></button>
              </div>
              <form onSubmit={saveServiceRecord} className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Serviços Selecionados</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-indigo-300 leading-snug">{taskToComplete.task.title}</p>
                </div>
                <input type="hidden" name="taskTitle" value={taskToComplete.task.title} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">KM Rodado</p>
                    <input required name="mileage" type="number" inputMode="numeric" defaultValue={taskToComplete.targetKm} placeholder="Ex: 10000" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</p>
                    <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Total (R$)</p>
                  <input required name="cost" type="number" step="0.01" inputMode="decimal" placeholder="Ex: 450.00" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white font-bold" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Detalhes (Opcional)</p>
                  <textarea name="notes" placeholder="Descreva as peças e oficina..." className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white h-20 resize-none" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest">Finalizar Registro</button>
              </form>
            </div>
          </div>
        )}

        {vehicleToDeleteId && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
              <AlertTriangle size={40} className="text-red-600 mx-auto" />
              <h3 className="text-lg font-black dark:text-white uppercase">Excluir Veículo?</h3>
              <p className="text-xs text-slate-500">Esta ação apagará todo o histórico do veículo permanentemente.</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmDeleteVehicle} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95">Confirmar Exclusão</button>
                <button onClick={() => setVehicleToDeleteId(null)} className="w-full py-4 text-slate-500 font-bold active:scale-95">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {newSightingAlert && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in zoom-in-95">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-indigo-500 text-center space-y-6">
              <MapPinned size={40} className="text-indigo-600 mx-auto" />
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase">Veículo Localizado!</h3>
              <p className="text-xs text-slate-500">
                {newSightingAlert.mapUrl
                  ? "Localização GPS enviada pela comunidade agora."
                  : "Um membro da comunidade informou a localização manualmente."}
              </p>
              {newSightingAlert.mapUrl && (
                <a
                  href={newSightingAlert.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black block uppercase text-xs shadow-xl active:scale-95"
                >
                  Abrir no Google Maps
                </a>
              )}
              <button
                onClick={() => setNewSightingAlert(null)}
                className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase hover:text-slate-600 transition-colors"
              >
                Fechar Notificação
              </button>
            </div>
          </div>
        )}

        <TheftReportModal
          isOpen={!!reportingTheftVehicleId}
          userPlan={userPlan}
          brazilianStates={BRAZILIAN_STATES}
          onClose={() => setReportingTheftVehicleId(null)}
          onSubmit={handleTheftReportSubmit}
        />

        {vehicleToRecoverId && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
              <Trophy size={40} className="text-emerald-600 mx-auto" />
              <h3 className="text-lg font-black dark:text-white uppercase">Confirmar Recuperação?</h3>
              <p className="text-xs text-slate-500">Isso removerá o alerta de roubo da comunidade e limpará o histórico de avistamentos.</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmRecovery} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95">Sim, foi recuperado!</button>
                <button onClick={() => setVehicleToRecoverId(null)} className="w-full py-4 text-slate-500 font-bold active:scale-95">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* CHATBOT IA */}
        <ChatBot
          vehicle={selectedVehicle}
          userPlan={userPlan}
          questionsRemaining={aiQuestionsRemaining}
          onMessageSent={handleChatMessageSent}
          onUpgrade={() => setShowSubscriptionModal(true)}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />

        {/* MODAL EXPLICAÇÃO SAÚDE DO VEÍCULO */}
        {showHealthExplanation && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95 text-center">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mx-auto flex items-center justify-center">
                <Activity size={40} className="text-indigo-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">O que é a Saúde?</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Entenda como calculamos este índice</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-left space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  A <strong>IA da AutoCare</strong> analisa diversos fatores para chegar a este percentual:
                </p>
                <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>Quilometragem:</strong> Comparação com o plano de manutenção do fabricante.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>Histórico:</strong> Se os serviços preventivos estão sendo registrados em dia.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span><span><strong>Idade:</strong> O desgaste natural de componentes por tempo.</span></span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowHealthExplanation(false)}
                className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95"
              >
                Entendi
              </button>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMAÇÃO EXCLUSÃO DE CONTA */}
        {showDeleteAccountConfirm && (
          <div className="fixed inset-0 z-[2200] flex items-center justify-center p-6 bg-red-600/10 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl border-4 border-red-100 dark:border-red-900/30 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center">
                <Trash2 size={40} className="text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-red-600 uppercase tracking-tight">Excluir Conta?</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Esta ação é irreversível</p>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Ao excluir sua conta, todos os veículos, históricos de manutenção e configurações serão apagados permanentemente de nossos servidores.
              </p>
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeletingAccount ? <Loader2 size={18} className="animate-spin" /> : "Sim, Excluir Tudo"}
                </button>
                <button
                  onClick={() => setShowDeleteAccountConfirm(false)}
                  disabled={isDeletingAccount}
                  className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                >
                  Cancelar e Manter Dados
                </button>
              </div>
            </div>
          </div>
        )}
        {showFuelModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase text-sm tracking-tight">
                  <Activity size={20} className="text-emerald-600" /> Registro de Abastecimento
                </h3>
                <button onClick={() => setShowFuelModal(false)} className="p-1 text-slate-400"><X size={20} /></button>
              </div>
              <form onSubmit={handleFuelSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">KM Atual</p>
                    <input required name="mileage" type="number" inputMode="numeric" defaultValue={selectedVehicle?.currentMileage} placeholder="Ex: 10500" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white font-bold" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Litros</p>
                    <input required name="liters" type="number" step="0.01" inputMode="decimal" placeholder="Ex: 45.5" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Total (R$)</p>
                    <input required name="cost" type="number" step="0.01" inputMode="decimal" placeholder="Ex: 250.00" className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</p>
                    <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Combustível</p>
                  <select name="fuelType" defaultValue={selectedVehicle?.fuel} className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm dark:text-white">
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <input type="hidden" name="isFullTank" value="on" />
                <button type="submit" className="w-full bg-emerald-600 py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest">Salvar Abastecimento</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DICAS DE CONSUMO IA */}
        {showFuelAdviceModal && aiFuelAdvice?.tips && (
          <div className="fixed inset-0 z-[2300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Dicas de Consumo</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Personalizadas para seu veículo</p>
                  </div>
                </div>
                <button onClick={() => setShowFuelAdviceModal(false)} className="p-2 text-slate-400 bg-slate-100 dark:bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {aiFuelAdvice.tips.map((tip: string, idx: number) => (
                  <div key={idx} className="flex gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="shrink-0 w-1.5 bg-indigo-400 rounded-full" />
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{tip}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowFuelAdviceModal(false)}
                className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default App;
