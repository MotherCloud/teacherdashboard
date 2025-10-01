import React, { useState, useEffect, useRef } from 'react';
import { Clock, Users, Shuffle, Play, Pause, RotateCw, X, Plus, Save, Trash2, Lock, Unlock, Settings, Move, Palette } from 'lucide-react';

const TeacherDashboard = () => {
  // PWA Installation
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('Service worker registration not available in this environment');
      });
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSound, setTimerSound] = useState(true);
  const [selectedSound, setSelectedSound] = useState('chime');
  
  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  
  // Name list state
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState('');
  
  // Groups state
  const [groups, setGroups] = useState([]);
  const [numGroups, setNumGroups] = useState(4);
  const [membersPerGroup, setMembersPerGroup] = useState(0);
  const [selectedNames, setSelectedNames] = useState([]);
  const [fixedGroups, setFixedGroups] = useState(new Set());
  const [lockedMembers, setLockedMembers] = useState({});
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [showNameSettings, setShowNameSettings] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [groupLayout, setGroupLayout] = useState('grid');
  const [draggingGroup, setDraggingGroup] = useState(null);
  const [groupPositions, setGroupPositions] = useState({});
  
  // Widget positioning state
  const [widgetPositions, setWidgetPositions] = useState({
    timer: { x: 20, y: 100 },
    stopwatch: { x: 420, y: 100 },
    random: { x: 820, y: 100 },
    groups: { x: 20, y: 450 }
  });
  const [draggingWidget, setDraggingWidget] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Background state
  const [background, setBackground] = useState('gradient1');
  const [showBgPicker, setShowBgPicker] = useState(false);
  
  const backgrounds = {
    gradient1: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50',
    gradient2: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50',
    gradient3: 'bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50',
    gradient4: 'bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50',
    gradient5: 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100',
    solid1: 'bg-slate-100',
    solid2: 'bg-blue-50',
    solid3: 'bg-indigo-50',
    dark1: 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900',
    dark2: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
  };
  
  const groupColors = [
    { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', hover: 'hover:bg-blue-100' },
    { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', hover: 'hover:bg-green-100' },
    { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', hover: 'hover:bg-purple-100' },
    { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-800', hover: 'hover:bg-pink-100' },
    { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', hover: 'hover:bg-yellow-100' },
    { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', hover: 'hover:bg-red-100' },
    { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-800', hover: 'hover:bg-indigo-100' },
    { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-800', hover: 'hover:bg-teal-100' }
  ];
  
  const timerIntervalRef = useRef(null);
  const stopwatchIntervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Load widget positions and background
  useEffect(() => {
    const savedPositions = localStorage.getItem('widgetPositions');
    const savedBackground = localStorage.getItem('dashboardBackground');
    const savedLayout = localStorage.getItem('groupLayout');
    const savedGroupPositions = localStorage.getItem('groupPositions');
    if (savedPositions) setWidgetPositions(JSON.parse(savedPositions));
    if (savedBackground) setBackground(savedBackground);
    if (savedLayout) setGroupLayout(savedLayout);
    if (savedGroupPositions) setGroupPositions(JSON.parse(savedGroupPositions));
  }, []);

  // Save widget positions
  useEffect(() => {
    localStorage.setItem('widgetPositions', JSON.stringify(widgetPositions));
  }, [widgetPositions]);

  // Save background
  useEffect(() => {
    localStorage.setItem('dashboardBackground', background);
  }, [background]);

  // Save group layout
  useEffect(() => {
    localStorage.setItem('groupLayout', groupLayout);
  }, [groupLayout]);

  // Save group positions
  useEffect(() => {
    localStorage.setItem('groupPositions', JSON.stringify(groupPositions));
  }, [groupPositions]);

  // Drag handlers
  const handleMouseDown = (e, widgetId) => {
    if (e.target.closest('input, button, select')) return;
    setDraggingWidget(widgetId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleGroupMouseDown = (e, groupId) => {
    if (groupLayout !== 'free') return;
    if (e.target.closest('input, button, select')) return;
    setDraggingGroup(groupId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (draggingWidget) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setWidgetPositions(prev => ({
        ...prev,
        [draggingWidget]: { x: Math.max(0, newX), y: Math.max(0, newY) }
      }));
    } else if (draggingGroup !== null) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setGroupPositions(prev => ({
        ...prev,
        [draggingGroup]: { x: Math.max(0, newX), y: Math.max(0, newY) }
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingWidget(null);
    setDraggingGroup(null);
  };

  useEffect(() => {
    if (draggingWidget || draggingGroup !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingWidget, draggingGroup, dragOffset]);

  // Function to play sounds using Web Audio API
  const playSound = (soundType) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    if (soundType === 'chime') {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.5);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.5);
      });
    } else if (soundType === 'bell') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
      osc.start(now);
      osc.stop(now + 1);
    } else if (soundType === 'birdsong') {
      const chirps = [
        [1200, 0, 0.08],
        [1400, 0.1, 0.08],
        [1600, 0.2, 0.1],
        [1800, 0.35, 0.06],
        [2000, 0.42, 0.08],
        [1600, 0.52, 0.1],
        [1400, 0.64, 0.08]
      ];
      
      chirps.forEach(([freq, startTime, duration]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, now + startTime);
        gain.gain.linearRampToValueAtTime(0.2, now + startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + startTime + duration);
        osc.start(now + startTime);
        osc.stop(now + startTime + duration);
      });
    } else if (soundType === 'buzz') {
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 400;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.3, now + i * 0.3);
        gain.gain.setValueAtTime(0, now + i * 0.3 + 0.2);
        osc.start(now + i * 0.3);
        osc.stop(now + i * 0.3 + 0.2);
      }
    }
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedNames = localStorage.getItem('teacherDashboardNames');
    const savedGroups = localStorage.getItem('teacherDashboardGroups');
    const savedFixed = localStorage.getItem('teacherDashboardFixedGroups');
    const savedLocked = localStorage.getItem('teacherDashboardLockedMembers');
    
    if (savedNames) setNames(JSON.parse(savedNames));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    if (savedFixed) setFixedGroups(new Set(JSON.parse(savedFixed)));
    if (savedLocked) setLockedMembers(JSON.parse(savedLocked));
  }, []);

  useEffect(() => {
    localStorage.setItem('teacherDashboardNames', JSON.stringify(names));
  }, [names]);

  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem('teacherDashboardGroups', JSON.stringify(groups));
    }
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('teacherDashboardFixedGroups', JSON.stringify([...fixedGroups]));
  }, [fixedGroups]);

  useEffect(() => {
    localStorage.setItem('teacherDashboardLockedMembers', JSON.stringify(lockedMembers));
  }, [lockedMembers]);

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev === 0) {
            if (timerMinutes === 0) {
              setTimerRunning(false);
              if (timerSound) {
                playSound(selectedSound);
              }
              return 0;
            }
            setTimerMinutes(m => m - 1);
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning, timerMinutes, timerSound, selectedSound]);

  // Stopwatch logic
  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(stopwatchIntervalRef.current);
  }, [stopwatchRunning]);

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerMinutes(5);
    setTimerSeconds(0);
  };

  const resetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  const addName = () => {
    if (newName.trim()) {
      setNames([...names, newName.trim()]);
      setNewName('');
    }
  };

  const removeName = (index) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const randomSelect = () => {
    if (names.length > 0) {
      const random = names[Math.floor(Math.random() * names.length)];
      alert(`Selected: ${random}`);
    }
  };

  const generateGroups = () => {
    const availableNames = selectedNames.length > 0 ? 
      names.filter(name => selectedNames.includes(name)) : 
      [...names];
    
    if (availableNames.length === 0) return;

    const existingGroups = groups.length === numGroups ? groups : [];

    const newGroups = Array.from({ length: numGroups }, (_, i) => ({
      id: i,
      title: existingGroups[i]?.title || `Group ${i + 1}`,
      colorIndex: existingGroups[i]?.colorIndex ?? (i % groupColors.length),
      members: []
    }));

    Object.entries(lockedMembers).forEach(([name, groupId]) => {
      if (availableNames.includes(name) && groupId < numGroups) {
        newGroups[groupId].members.push(name);
        availableNames.splice(availableNames.indexOf(name), 1);
      }
    });

    const shuffled = [...availableNames].sort(() => Math.random() - 0.5);
    
    if (membersPerGroup > 0) {
      shuffled.forEach((name, i) => {
        const groupIndex = Math.floor(i / membersPerGroup) % numGroups;
        if (newGroups[groupIndex].members.length < membersPerGroup) {
          newGroups[groupIndex].members.push(name);
        }
      });
    } else {
      shuffled.forEach((name, i) => {
        newGroups[i % numGroups].members.push(name);
      });
    }

    setGroups(newGroups);
  };

  const rotateGroups = () => {
    if (groups.length === 0) return;

    const newGroups = groups.map((group, i) => ({ 
      ...group, 
      id: i,
      title: group.title,
      colorIndex: group.colorIndex,
      members: [] 
    }));
    const fixedGroupsArray = [...fixedGroups];

    groups.forEach((group, currentIndex) => {
      let targetIndex = currentIndex;
      
      if (!fixedGroupsArray.includes(currentIndex)) {
        do {
          targetIndex = (targetIndex + 1) % groups.length;
        } while (fixedGroupsArray.includes(targetIndex) && targetIndex !== currentIndex);
      }

      newGroups[targetIndex].members = [...group.members];
    });

    setGroups(newGroups);
  };

  const toggleFixedGroup = (groupId) => {
    const newFixed = new Set(fixedGroups);
    if (newFixed.has(groupId)) {
      newFixed.delete(groupId);
    } else {
      newFixed.add(groupId);
    }
    setFixedGroups(newFixed);
  };

  const toggleLockedMember = (name, groupId) => {
    const newLocked = { ...lockedMembers };
    const currentLock = newLocked[name];
    
    if (currentLock === groupId) {
      delete newLocked[name];
    } else {
      newLocked[name] = groupId;
    }
    setLockedMembers(newLocked);
  };

  const updateGroupColor = (groupId, colorIndex) => {
    const newGroups = groups.map(g => 
      g.id === groupId ? { ...g, colorIndex } : g
    );
    setGroups(newGroups);
  };

  const clearAll = () => {
    if (window.confirm('Clear all data? This will remove names, groups, and settings.')) {
      setNames([]);
      setGroups([]);
      setSelectedNames([]);
      setFixedGroups(new Set());
      setLockedMembers({});
      localStorage.removeItem('teacherDashboardNames');
      localStorage.removeItem('teacherDashboardGroups');
      localStorage.removeItem('teacherDashboardFixedGroups');
      localStorage.removeItem('teacherDashboardLockedMembers');
    }
  };

  const formatStopwatchTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const isDarkBg = background.includes('dark');

  return (
    <div className={`min-h-screen ${backgrounds[background]} p-4 relative`} style={{ minHeight: '100vh', minWidth: '100vw', overflow: 'auto', paddingBottom: '100px' }}>
      {/* Header */}
      <div className={`max-w-7xl mx-auto flex justify-between items-center mb-6 ${isDarkBg ? 'text-white' : 'text-gray-800'}`}>
        <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
        <div className="flex gap-2">
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              Install App
            </button>
          )}
          <button
            onClick={() => setShowBgPicker(!showBgPicker)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isDarkBg 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            <Palette size={18} />
            Background
          </button>
          <button
            onClick={clearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Trash2 size={18} />
            Clear All
          </button>
        </div>
      </div>

      {/* Background Picker */}
      {showBgPicker && (
        <div className="fixed top-20 right-4 bg-white rounded-xl shadow-2xl p-4 z-50 border-2 border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Choose Background</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(backgrounds).map(([key, value]) => (
              <button
                key={key}
                onClick={() => {
                  setBackground(key);
                  setShowBgPicker(false);
                }}
                className={`w-16 h-16 rounded-lg border-2 ${value} ${
                  background === key ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-300'
                } hover:scale-105 transition-transform`}
                title={key}
              />
            ))}
          </div>
        </div>
      )}

      {/* Timer Widget */}
      <div
        style={{
          position: 'absolute',
          left: widgetPositions.timer.x,
          top: widgetPositions.timer.y,
          cursor: draggingWidget === 'timer' ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'timer')}
        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow w-80"
      >
        <div className="flex items-center gap-2 mb-4">
          <Move className="text-gray-400" size={16} />
          <Clock className="text-indigo-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Timer</h2>
        </div>
        <div className="text-5xl font-bold text-center text-indigo-600 mb-4">
          {timerMinutes.toString().padStart(2, '0')}:{timerSeconds.toString().padStart(2, '0')}
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={timerMinutes}
            onChange={(e) => setTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Min"
            disabled={timerRunning}
          />
          <input
            type="number"
            value={timerSeconds}
            onChange={(e) => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Sec"
            disabled={timerRunning}
          />
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {timerRunning ? <Pause size={18} /> : <Play size={18} />}
            {timerRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCw size={18} />
            Reset
          </button>
        </div>
        <label className="flex items-center gap-2 text-gray-700 mb-3">
          <input
            type="checkbox"
            checked={timerSound}
            onChange={(e) => setTimerSound(e.target.checked)}
            className="w-4 h-4"
          />
          Play sound when complete
        </label>
        {timerSound && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sound:</label>
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="chime">Chime</option>
              <option value="bell">Bell</option>
              <option value="birdsong">Birdsong</option>
              <option value="buzz">Buzz</option>
            </select>
            <button
              onClick={() => playSound(selectedSound)}
              className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded text-xs transition-colors"
            >
              Test
            </button>
          </div>
        )}
      </div>

      {/* Stopwatch Widget */}
      <div
        style={{
          position: 'absolute',
          left: widgetPositions.stopwatch.x,
          top: widgetPositions.stopwatch.y,
          cursor: draggingWidget === 'stopwatch' ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'stopwatch')}
        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow w-80"
      >
        <div className="flex items-center gap-2 mb-4">
          <Move className="text-gray-400" size={16} />
          <Clock className="text-purple-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Stopwatch</h2>
        </div>
        <div className="text-5xl font-bold text-center text-purple-600 mb-8">
          {formatStopwatchTime(stopwatchTime)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStopwatchRunning(!stopwatchRunning)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {stopwatchRunning ? <Pause size={18} /> : <Play size={18} />}
            {stopwatchRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetStopwatch}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCw size={18} />
            Reset
          </button>
        </div>
      </div>

      {/* Random Selector Widget */}
      <div
        style={{
          position: 'absolute',
          left: widgetPositions.random.x,
          top: widgetPositions.random.y,
          cursor: draggingWidget === 'random' ? 'grabbing' : 'grab'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'random')}
        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow w-80"
      >
        <div className="flex items-center gap-2 mb-4">
          <Move className="text-gray-400" size={16} />
          <Shuffle className="text-green-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Random Selector</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Select a random name from your list</p>
          <button
            onClick={randomSelect}
            disabled={names.length === 0}
            className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mx-auto ${
              names.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Shuffle size={18} />
            Pick Random Name
          </button>
        </div>
      </div>

      {/* Group Maker Widget */}
      <div
        style={{
          position: 'absolute',
          left: widgetPositions.groups.x,
          top: widgetPositions.groups.y,
          cursor: draggingWidget === 'groups' ? 'grabbing' : 'grab',
          minWidth: '800px',
          maxWidth: '95vw'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'groups')}
        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Move className="text-gray-400" size={16} />
            <Users className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Group Maker</h2>
          </div>
          <div className="flex gap-2">
            <select
              value={groupLayout}
              onChange={(e) => setGroupLayout(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
            >
              <option value="grid">Grid Layout</option>
              <option value="vertical">Vertical Side-by-Side</option>
              <option value="horizontal">Horizontal Stack</option>
              <option value="carousel">Carousel View</option>
              <option value="compact">Compact List</option>
            </select>
            <button
              onClick={() => setShowGroupSettings(!showGroupSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <Settings size={18} />
              Group Settings
            </button>
            <button
              onClick={() => setShowNameSettings(!showNameSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Settings size={18} />
              Manage Names
            </button>
          </div>
        </div>

        {/* Name Settings Panel */}
        {showNameSettings && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Name List</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addName()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter name"
              />
              <button
                onClick={addName}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {names.map((name, index) => (
                <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg">
                  <span className="text-gray-800">{name}</span>
                  <button
                    onClick={() => removeName(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              {names.length === 0 && (
                <p className="text-gray-500 text-center py-4">No names added yet</p>
              )}
            </div>
          </div>
        )}
        
        {/* Group Settings Panel */}
        {showGroupSettings && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-4">Group Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Groups</label>
                <input
                  type="number"
                  value={numGroups}
                  onChange={(e) => setNumGroups(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Members per Group (0 = auto)</label>
                <input
                  type="number"
                  value={membersPerGroup}
                  onChange={(e) => setMembersPerGroup(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                <button
                  onClick={generateGroups}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Generate Groups
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Members (leave empty for all)</label>
              <div className="flex flex-wrap gap-2">
                {names.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      if (selectedNames.includes(name)) {
                        setSelectedNames(selectedNames.filter(n => n !== name));
                      } else {
                        setSelectedNames([...selectedNames, name]);
                      }
                    }}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      selectedNames.includes(name)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={
          groupLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' :
          groupLayout === 'vertical' ? 'flex flex-row gap-4 overflow-x-auto pb-4' :
          groupLayout === 'horizontal' ? 'flex flex-col gap-4' :
          groupLayout === 'carousel' ? 'flex flex-row gap-6 overflow-x-auto pb-4 snap-x snap-mandatory' :
          'space-y-2'
        }>
          {groups.map((group) => {
            const colorScheme = groupColors[group.colorIndex || 0] || groupColors[0];
            const groupTitle = group.title || `Group ${group.id + 1}`;
            
            if (groupLayout === 'compact') {
              return (
                <div
                  key={group.id}
                  className={`border-l-4 rounded-lg p-3 transition-all bg-white ${
                    fixedGroups.has(group.id)
                      ? 'border-orange-500 ring-2 ring-orange-300'
                      : colorScheme.border.replace('border-', 'border-l-')
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingGroupId === group.id ? (
                        <input
                          type="text"
                          value={groupTitle}
                          onChange={(e) => {
                            const newGroups = groups.map(g => 
                              g.id === group.id ? { ...g, title: e.target.value } : g
                            );
                            setGroups(newGroups);
                          }}
                          onBlur={() => setEditingGroupId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingGroupId(null);
                            }
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold mr-2"
                          autoFocus
                        />
                      ) : (
                        <h3 
                          className={`font-semibold ${colorScheme.text} cursor-pointer hover:underline transition-all text-base inline-block mr-2`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGroupId(group.id);
                          }}
                          title="Click to edit"
                        >
                          {groupTitle}
                        </h3>
                      )}
                      <span className="text-sm text-gray-600">
                        {group.members.join(', ') || 'No members'}
                      </span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <select
                        value={group.colorIndex || 0}
                        onChange={(e) => updateGroupColor(group.id, parseInt(e.target.value))}
                        className="px-2 py-1 text-xs border border-gray-300 rounded cursor-pointer"
                        title="Change color"
                      >
                        <option value="0">Blue</option>
                        <option value="1">Green</option>
                        <option value="2">Purple</option>
                        <option value="3">Pink</option>
                        <option value="4">Yellow</option>
                        <option value="5">Red</option>
                        <option value="6">Indigo</option>
                        <option value="7">Teal</option>
                      </select>
                      <button
                        onClick={() => toggleFixedGroup(group.id)}
                        className={`p-1 rounded transition-colors ${
                          fixedGroups.has(group.id)
                            ? 'text-orange-600 hover:text-orange-700'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={fixedGroups.has(group.id) ? 'Unfix group' : 'Fix group'}
                      >
                        <Lock size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
            <div
              key={group.id}
              className={`border-2 rounded-lg p-4 transition-all ${colorScheme.bg} ${
                fixedGroups.has(group.id)
                  ? 'border-orange-500 ring-2 ring-orange-300'
                  : colorScheme.border
              } ${
                groupLayout === 'vertical' ? 'min-w-[280px] flex-shrink-0' :
                groupLayout === 'carousel' ? 'min-w-[320px] flex-shrink-0 snap-center' :
                ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                {editingGroupId === group.id ? (
                  <input
                    type="text"
                    value={groupTitle}
                    onChange={(e) => {
                      const newGroups = groups.map(g => 
                        g.id === group.id ? { ...g, title: e.target.value } : g
                      );
                      setGroups(newGroups);
                    }}
                    onBlur={() => setEditingGroupId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingGroupId(null);
                      }
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-semibold mr-2"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className={`font-semibold ${colorScheme.text} cursor-pointer hover:underline transition-all mr-2 text-base`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroupId(group.id);
                    }}
                    title="Click to edit"
                  >
                    {groupTitle}
                  </h3>
                )}
                <div className="flex gap-1 items-center">
                  <select
                    value={group.colorIndex || 0}
                    onChange={(e) => updateGroupColor(group.id, parseInt(e.target.value))}
                    className="px-2 py-1 text-xs border border-gray-300 rounded cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${
                        colorScheme.bg === 'bg-blue-50' ? '#dbeafe' :
                        colorScheme.bg === 'bg-green-50' ? '#dcfce7' :
                        colorScheme.bg === 'bg-purple-50' ? '#faf5ff' :
                        colorScheme.bg === 'bg-pink-50' ? '#fdf2f8' :
                        colorScheme.bg === 'bg-yellow-50' ? '#fefce8' :
                        colorScheme.bg === 'bg-red-50' ? '#fef2f2' :
                        colorScheme.bg === 'bg-indigo-50' ? '#eef2ff' :
                        '#f0fdfa'
                      }, ${
                        colorScheme.border === 'border-blue-300' ? '#93c5fd' :
                        colorScheme.border === 'border-green-300' ? '#86efac' :
                        colorScheme.border === 'border-purple-300' ? '#d8b4fe' :
                        colorScheme.border === 'border-pink-300' ? '#f9a8d4' :
                        colorScheme.border === 'border-yellow-300' ? '#fde047' :
                        colorScheme.border === 'border-red-300' ? '#fca5a5' :
                        colorScheme.border === 'border-indigo-300' ? '#a5b4fc' :
                        '#5eead4'
                      })`
                    }}
                    title="Change color"
                  >
                    <option value="0">Blue</option>
                    <option value="1">Green</option>
                    <option value="2">Purple</option>
                    <option value="3">Pink</option>
                    <option value="4">Yellow</option>
                    <option value="5">Red</option>
                    <option value="6">Indigo</option>
                    <option value="7">Teal</option>
                  </select>
                  <button
                    onClick={() => toggleFixedGroup(group.id)}
                    className={`p-1 rounded transition-colors ${
                      fixedGroups.has(group.id)
                        ? 'text-orange-600 hover:text-orange-700'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={fixedGroups.has(group.id) ? 'Unfix group' : 'Fix group'}
                  >
                    <Lock size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div
                    key={member}
                    className={`flex items-center justify-between bg-white px-2 py-1 rounded ${colorScheme.hover} transition-colors`}
                  >
                    <span className="text-sm text-gray-800">{member}</span>
                    <button
                      onClick={() => toggleLockedMember(member, group.id)}
                      className={`p-1 rounded transition-colors ${
                        lockedMembers[member] === group.id
                          ? 'text-blue-600 hover:text-blue-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={lockedMembers[member] === group.id ? 'Unlock member' : 'Lock member'}
                    >
                      {lockedMembers[member] === group.id ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
          })}
        </div>

        {/* Rotate Button - Always Visible */}
        {groups.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={rotateGroups}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <RotateCw size={20} />
              Rotate Groups
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;