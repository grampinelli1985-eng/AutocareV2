// Force deploy: 2026-01-06T21:43:00-03:00
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, ChevronRight, Trash2, Car as CarIcon, PenTool, Eye, ShieldCheck, FileText, Lock, Loader2, Sparkles, AlertTriangle, Download, ShieldAlert, Trophy, MapPinned, MapPin, Navigation, Flag, Crown } from 'lucide-react';
import Layout from './components/Layout';
import VehicleCard from './components/VehicleCard';
import MaintenanceTimeline from './components/MaintenanceTimeline';
import LoginScreen from './components/LoginScreen';
import ChatBot from './components/ChatBot';
import { TermsModal } from './components/TermsModal';
import { AddVehicleModal } from './components/AddVehicleModal';
import { TheftReportModal } from './components/TheftReportModal';
import { SightingModal } from './components/SightingModal';
import { MilestoneDetailModal } from './components/MilestoneDetailModal';
import { RecoverySuccessModal } from './components/RecoverySuccessModal';
import { ServiceRegistrationModal } from './components/ServiceRegistrationModal';
import { VehicleDeletionModal } from './components/VehicleDeletionModal';
import { SightingSuccessModal } from './components/SightingSuccessModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { TheftAlertModal } from './components/TheftAlertModal';
import { MaintenanceReportModal } from './components/MaintenanceReportModal';
import { PremiumSubscriptionModal } from './components/PremiumSubscriptionModal';
import { PaymentSheet } from './components/PaymentSheet';
import { PerformanceCard } from './components/PerformanceCard';
import { FipeCard } from './components/FipeCard';
import { FuelRegistrationModal } from './components/FuelRegistrationModal';
import { HealthExplanationModal } from './components/HealthExplanationModal';
import { FuelAdviceModal } from './components/FuelAdviceModal';
import { ReceiptViewModal } from './components/ReceiptViewModal';
import { AccountDeletionModal } from './components/AccountDeletionModal';
import { RecoveryConfirmationModal } from './components/RecoveryConfirmationModal';
import { FuelConsumptionCard } from './components/FuelConsumptionCard';
import { PreventiveRadarCard } from './components/PreventiveRadarCard';
import { Vehicle, MaintenanceTask, ServiceRecord, TheftReport, MaintenanceMilestone, MaintenancePriority, TheftSighting, FuelLog } from './types';
import { getSmartMaintenanceAdvice, getFuelEconomyAdvice, analyzeInvoice } from './services/geminiService';
import { getFipeValue, FipeData } from './services/fipeService';
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
  const [scannedFile, setScannedFile] = useState<File | null>(null);

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
  const [showReportModal, setShowReportModal] = useState(false); // For TheftReportModal
  const [showSightingModal, setShowSightingModal] = useState(false); // For SightingModal
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
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fuelCostInput, setFuelCostInput] = useState('');
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [fipeData, setFipeData] = useState<FipeData | null>(null);
  const [isFipeLoading, setIsFipeLoading] = useState(false);

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
        r.mileage >= km - 5000 && r.mileage <= km + 5000
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
  }, [selectedVehicle, vehicleRecords]);

  const performanceScore = useMemo(() => {
    if (!selectedVehicle) return { eco: 0, conservation: 0, level: 1, title: 'Iniciante' };

    // 1. Eco Score (0-100) - Heurística simples baseada no tipo de combustível
    let eco = 70; // Score base para quem não tem logs suficientes
    if (averageConsumption) {
      const avg = parseFloat(averageConsumption);
      // Alvos médios realistas (km/l)
      let target = 10;
      if (selectedVehicle.fuel.includes('Etanol')) target = 8.5;
      if (selectedVehicle.fuel.includes('Diesel')) target = 13.5;
      if (selectedVehicle.fuel.includes('Híbrido')) target = 18;

      const diff = avg - target;
      eco = Math.min(100, Math.max(10, Math.round(70 + (diff * 5))));
    }

    // 2. Conservation Score (0-100) - Baseado em revisões em dia e saúde IA
    const doneCount = milestones.filter(m => m.status === 'done').length;
    const overdueCount = milestones.filter(m => m.status === 'overdue').length;
    const totalPast = doneCount + overdueCount;

    let maintenanceBonus = 100;
    if (totalPast > 0) {
      maintenanceBonus = Math.round((doneCount / totalPast) * 100);
    }

    const aiHealth = aiAnalysis?.healthScore || 85;
    const conservation = Math.round((maintenanceBonus * 0.6) + (aiHealth * 0.4));

    // 3. Nível (1-10)
    const avgScore = (eco + conservation) / 2;
    const level = Math.max(1, Math.min(10, Math.floor(avgScore / 10)));

    const titles = [
      'Recém-Chegado', 'Motorista Consciente', 'Guardião do Veículo',
      'Piloto Eficiente', 'Ninja da Manutenção', 'Estrategista das Ruas',
      'Líder da Estrada', 'Mestre de Frota', 'Embaixador AutoCare', 'Lenda do Volante'
    ];
    const title = titles[level - 1] || 'Especialista';

    return { eco, conservation, level, title };
  }, [selectedVehicle, averageConsumption, milestones, aiAnalysis]);

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

  useEffect(() => {
    if (selectedVehicle && isLoggedIn) {
      setIsFipeLoading(true);
      getFipeValue(
        selectedVehicle.brand,
        `${selectedVehicle.model} ${selectedVehicle.engine} ${selectedVehicle.transmission}`,
        selectedVehicle.year,
        selectedVehicle.fuel
      )
        .then(data => {
          setFipeData(data);
          setIsFipeLoading(false);
        })
        .catch(() => setIsFipeLoading(false));
    }
  }, [selectedVehicle?.id, isLoggedIn]);

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
        .eq('owner_id', session.user.id);

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
    const reportContainer = document.getElementById('printable-report');
    if (!reportContainer || isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      const originalStyle = reportContainer.getAttribute('style') || '';
      reportContainer.style.height = 'auto';
      reportContainer.style.overflow = 'visible';
      reportContainer.style.width = '800px';
      reportContainer.style.position = 'relative';

      // Select all chunks to print
      const chunks = Array.from(reportContainer.querySelectorAll('.print-chunk')) as HTMLElement[];

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 10; // 10mm margin
      const printableWidth = pdfWidth - (margin * 2);
      const printableHeight = pdfHeight - (margin * 2);

      let currentY = margin;
      let isFirstPage = true;

      for (const chunk of chunks) {
        // Prepare chunk for capture (handle potential transparency/styles)
        const canvas = await html2canvas(chunk, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * printableWidth) / imgProps.width;

        // Check if we need a new page
        if (!isFirstPage && (currentY + imgHeight > pdfHeight - margin)) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, printableWidth, imgHeight);
        currentY += imgHeight;
        isFirstPage = false;
      }

      reportContainer.setAttribute('style', originalStyle);
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
      version: fd.get('version') as string,
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
        message: `${vehicleData.brand} ${vehicleData.model} ${vehicleData.version || ''} agora faz parte da sua garagem.`
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

  const fileToBase64 = (file: File): Promise<{ base64: string; type: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result?.toString().split(',')[1] || '';
        resolve({ base64: base64String, type: file.type || 'image/jpeg' });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInvoiceScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (userPlan === 'free') {
      setShowSubscriptionModal(true);
      return;
    }

    setScannedFile(file);

    try {
      setIsScanning(true);
      const { base64, type } = await fileToBase64(file);
      const extractedData = await analyzeInvoice(base64, type);

      if (extractedData) {
        // Preencher os campos do formulário se a IA encontrou os dados
        const costInput = document.getElementById('record-cost') as HTMLInputElement;
        const dateInput = document.getElementById('record-date') as HTMLInputElement;
        const notesTextarea = document.querySelector('textarea[name="notes"]') as HTMLTextAreaElement;

        if (extractedData.cost && costInput) costInput.value = extractedData.cost.toString();
        if (extractedData.date && dateInput) dateInput.value = extractedData.date;
        if (extractedData.notes && notesTextarea) notesTextarea.value = extractedData.notes;

        // Feedback visual
        addNotification({
          type: 'info',
          title: 'Scanner IA Concluído',
          message: 'Dados extraídos da nota fiscal e preenchidos no formulário.'
        });
      }
    } catch (error: any) {
      console.error('Erro detalhado no scanner:', error);
      const errorMessage = error?.message || 'Erro de conexão ou processamento';
      alert(`Não foi possível ler esta nota automaticamente: ${errorMessage}. Por favor, preencha os campos manualmente.`);
    } finally {
      setIsScanning(false);
    }
  };

  const saveServiceRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!selectedVehicleId || !taskToComplete || !session?.user) return;

    const mileage = parseInt(fd.get('mileage') as string);

    let receiptUrl = '';
    if (scannedFile) {
      const fileName = `${session.user.id}/${Date.now()}_${scannedFile.name.replace(/\s/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, scannedFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName);
        receiptUrl = publicUrl;
      } else {
        console.error("Erro ao subir arquivo:", uploadError);
      }
    }

    const newRecordData: any = {
      vehicle_id: selectedVehicleId,
      user_id: session.user.id,
      task_title: (fd.get('taskTitle') as string) || taskToComplete.task.title,
      date: fd.get('date') as string,
      mileage,
      cost: parseFloat(fd.get('cost') as string) || 0,
      notes: fd.get('notes') as string,
      receipt_url: receiptUrl // Agora incluímos a URL da nota
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
      taskTitle: record.task_title,
      receiptUrl: record.receipt_url
    };
    setRecords(prev => [...prev, mappedRecord]);
    setScannedFile(null);
    setTaskToComplete(null);

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

  const handleFuelCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (!value) {
      setFuelCostInput('');
      return;
    }
    const amount = (parseInt(value) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    setFuelCostInput(amount);
  };

  const handleFuelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !selectedVehicleId) return;

    const fd = new FormData(e.currentTarget);
    const mileage = parseInt(fd.get('mileage') as string);
    const liters = parseFloat(fd.get('liters') as string);

    // Parse currency BRL back to number
    const costString = fuelCostInput.replace(/[^\d,]/g, '').replace(',', '.');
    const cost = parseFloat(costString) || 0;

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
    setFuelCostInput('');

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
    setActiveTab(tabId);
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
        <TheftAlertModal
          alert={activeCommunityAlert && (activeCommunityAlert.report.reporterPlan === 'premium' || (
            !activeCommunityAlert.report.latitude || !vehicles[0]?.lastKnownLat ? true :
              calculateDistance(
                vehicles[0]?.lastKnownLat || 0,
                vehicles[0]?.lastKnownLng || 0,
                activeCommunityAlert.report.latitude,
                activeCommunityAlert.report.longitude
              ) <= 50
          )) ? activeCommunityAlert : null}
          onClose={() => setActiveCommunityAlert(null)}
        />

        <NotificationCenterModal
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
        />

        <MaintenanceReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          vehicle={selectedVehicle}
          records={vehicleRecords}
          onDownload={printReport}
          isDownloading={isGeneratingPdf}
          onViewReceipt={(url) => {
            setSelectedReceiptUrl(url);
            setShowReceiptModal(true);
          }}
        />

        <PremiumSubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onUpgrade={handleUpgradeToPremiumTrigger}
        />

        <PaymentSheet
          isOpen={showPaymentSheet}
          onClose={() => setShowPaymentSheet(false)}
          onConfirm={handleConfirmPurchase}
          isProcessing={isProcessingPayment}
          userEmail={session?.user?.email || null}
        />

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

        <ChatBot
          vehicle={selectedVehicle}
          isOpen={activeTab === 'chat'}
          onClose={() => setActiveTab('dashboard')}
          userPlan={userPlan}
          questionsRemaining={aiQuestionsRemaining}
          onMessageSent={handleChatMessageSent}
          onUpgrade={() => setShowSubscriptionModal(true)}
        />

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-tab-fade">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Meu Veículo</h2>
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
                    userPlan={userPlan}
                  />
                  <PerformanceCard
                    score={performanceScore}
                    averageConsumption={averageConsumption}
                    showModal={showPerformanceModal}
                    setShowModal={setShowPerformanceModal}
                  />

                  <FipeCard
                    fipeData={fipeData}
                    isLoading={isFipeLoading}
                    conservationScore={performanceScore.conservation}
                  />

                  <FuelConsumptionCard
                    averageConsumption={averageConsumption}
                    onReset={handleResetFuel}
                    onRefuel={() => setShowFuelModal(true)}
                    userPlan={userPlan}
                    onUnlockPremium={() => setShowSubscriptionModal(true)}
                    onShowAdvice={() => setShowFuelAdviceModal(true)}
                    isAiLoading={isFuelAiLoading}
                    hasAdvice={!!aiFuelAdvice?.tips}
                  />

                  <PreventiveRadarCard
                    isLoading={isLoading}
                    analysis={aiAnalysis}
                    userPlan={userPlan}
                  />
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

              {checkedTaskIds.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleRegisterFromChecklist}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <PenTool size={18} /> Registrar Serviços ({checkedTaskIds.length})
                  </button>
                </div>
              )}
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
              <div className="relative mx-auto mb-4 w-20 h-20">
                <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center font-black text-2xl shadow-xl transition-all duration-500 ${userPlan === 'premium'
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-4 ring-amber-100 shadow-amber-200 animate-in zoom-in-75'
                  : 'bg-indigo-100 dark:bg-slate-800 text-indigo-600'
                  }`}>
                  U
                </div>
                {userPlan === 'premium' && (
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-white p-1.5 rounded-2xl shadow-lg border-2 border-white animate-bounce-slow">
                    <Crown size={16} fill="currentColor" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg dark:text-white">{session?.user?.email || 'Motorista AutoCare'}</h3>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full uppercase text-[10px] font-black tracking-wider ${userPlan === 'premium'
                ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}>
                {userPlan === 'premium' ? <Crown size={12} strokeWidth={3} /> : <ShieldCheck size={12} strokeWidth={3} />}
                Plano {userPlan}
              </div>
            </div>

            {userPlan === 'free' && (
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-[32px] text-white shadow-xl shadow-amber-200 dark:shadow-none space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-black uppercase tracking-tight">Upgrade Premium</h4>
                  <Crown size={24} />
                </div>
                <p className="text-xs font-bold leading-relaxed opacity-90">Libere IA especialista, alertas nacional comunitários de roubo, relatórios em PDF, veículos ilimitados e mais por apenas R$ 15,99/mês.</p>
                <p className="text-xs font-bold leading-relaxed opacity-90">Cancele a qualquer momento pela Google Play Store.</p>
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

        <RecoverySuccessModal
          report={activeRecoveryAlert}
          onClose={() => setActiveRecoveryAlert(null)}
        />

        <MilestoneDetailModal
          milestone={selectedMilestoneDetail}
          checkedTaskIds={checkedTaskIds}
          onToggleTask={toggleTaskChecked}
          onClose={() => setSelectedMilestoneDetail(null)}
          onSave={handleRegisterFromChecklist}
          isSaving={false}
          onFileSelect={handleInvoiceScan}
          selectedFile={scannedFile}
          isCapturing={isScanning}
          userPlan={userPlan}
          onUnlockPremium={() => setShowSubscriptionModal(true)}
        />

        <ServiceRegistrationModal
          task={taskToComplete}
          onClose={() => { setTaskToComplete(null); setScannedFile(null); }}
          onSubmit={saveServiceRecord}
          isScanning={isScanning}
          onInvoiceScan={handleInvoiceScan}
          userPlan={userPlan}
          selectedFile={scannedFile}
          onUnlockPremium={() => setShowSubscriptionModal(true)}
        />

        <VehicleDeletionModal
          isOpen={!!vehicleToDeleteId}
          onClose={() => setVehicleToDeleteId(null)}
          onConfirm={confirmDeleteVehicle}
        />

        <SightingSuccessModal
          sighting={newSightingAlert}
          onClose={() => setNewSightingAlert(null)}
        />

        <TheftReportModal
          isOpen={!!reportingTheftVehicleId}
          userPlan={userPlan}
          brazilianStates={BRAZILIAN_STATES}
          onClose={() => setReportingTheftVehicleId(null)}
          onSubmit={handleTheftReportSubmit}
        />

        <RecoveryConfirmationModal
          isOpen={!!vehicleToRecoverId}
          onClose={() => setVehicleToRecoverId(null)}
          onConfirm={confirmRecovery}
        />

        <HealthExplanationModal
          isOpen={showHealthExplanation}
          onClose={() => setShowHealthExplanation(false)}
        />

        <AccountDeletionModal
          isOpen={showDeleteAccountConfirm}
          isDeleting={isDeletingAccount}
          onConfirm={handleDeleteAccount}
          onClose={() => setShowDeleteAccountConfirm(false)}
        />

        <FuelRegistrationModal
          isOpen={showFuelModal}
          costInput={fuelCostInput}
          onCostChange={handleFuelCostChange}
          onClose={() => { setShowFuelModal(false); setFuelCostInput(''); }}
          onSubmit={handleFuelSubmit}
          defaultMileage={selectedVehicle?.currentMileage}
          defaultFuelType={selectedVehicle?.fuel}
        />

        <FuelAdviceModal
          isOpen={showFuelAdviceModal}
          onClose={() => setShowFuelAdviceModal(false)}
          tips={aiFuelAdvice?.tips || []}
        />

        <ReceiptViewModal
          isOpen={showReceiptModal}
          url={selectedReceiptUrl}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedReceiptUrl(null);
          }}
        />
      </div >
    </Layout >
  );
};

export default App;
