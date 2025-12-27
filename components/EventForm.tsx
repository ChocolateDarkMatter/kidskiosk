import React, { useState, useEffect } from 'react';
import { ScheduledEvent, ScheduleTemplate } from '../types';
import { DAYS_OF_WEEK } from '../constants';

interface EventFormProps {
  events: ScheduledEvent[];
  onSave: (events: ScheduledEvent[]) => void;
  onClose: () => void;
  showDailyMagic: boolean;
  onToggleDailyMagic: (show: boolean) => void;
}

const PRESET_COLORS = ['#EF4444', '#F97316', '#FCD34D', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];
const PRESET_ICONS = ['🎒', '🥋', '🍳', '🥦', '💤', '🛁', '🎨', '🎮', '⚽', '🎹', '🧹', '📺', '🏞️', '🥪'];

const EventForm: React.FC<EventFormProps> = ({ events, onSave, onClose, showDailyMagic, onToggleDailyMagic }) => {
  const [localEvents, setLocalEvents] = useState<ScheduledEvent[]>(events);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'schedule' | 'templates'>('schedule');

  // Templates State
  const [templates, setTemplates] = useState<ScheduleTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('playroom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isNamingTemplate, setIsNamingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // New Item State
  const emptyEvent: ScheduledEvent = {
    id: '',
    title: '',
    startTime: '12:00',
    endTime: '13:00',
    days: [1, 2, 3, 4, 5],
    color: '#3B82F6',
    icon: '📅'
  };
  const [formData, setFormData] = useState<ScheduledEvent>(emptyEvent);

  const handleEdit = (event: ScheduledEvent) => {
    setEditingId(event.id);
    setFormData({ ...event });
  };

  const handleDelete = (id: string) => {
    const updated = localEvents.filter(e => e.id !== id);
    setLocalEvents(updated);
    if (editingId === id) {
      setEditingId(null);
      setFormData(emptyEvent);
    }
  };

  const handleSaveForm = () => {
    if (!formData.title) return;
    
    let updatedEvents;
    if (editingId) {
      updatedEvents = localEvents.map(e => e.id === editingId ? { ...formData } : e);
    } else {
      updatedEvents = [...localEvents, { ...formData, id: Date.now().toString() }];
    }
    
    setLocalEvents(updatedEvents);
    setFormData(emptyEvent);
    setEditingId(null);
  };

  const toggleDay = (dayIndex: number) => {
    const currentDays = formData.days;
    if (currentDays.includes(dayIndex)) {
      setFormData({ ...formData, days: currentDays.filter(d => d !== dayIndex) });
    } else {
      setFormData({ ...formData, days: [...currentDays, dayIndex].sort() });
    }
  };

  // --- Template Handlers ---

  const saveTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newTemplate: ScheduleTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      events: [...localEvents],
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('playroom_templates', JSON.stringify(updated));
    setNewTemplateName('');
    setIsNamingTemplate(false);
    setSidebarMode('templates');
  };

  const deleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      localStorage.setItem('playroom_templates', JSON.stringify(updated));
    }
  };

  const loadTemplate = (template: ScheduleTemplate) => {
    if (window.confirm(`Load preset "${template.name}" and apply immediately?`)) {
      // Apply immediately to the app
      onSave([...template.events]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-8">
      <div className="bg-white text-gray-800 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl">
        
        {/* --- LEFT COLUMN (Sidebar) --- */}
        <div className="w-full lg:w-1/3 h-1/3 lg:h-full bg-gray-50 border-r border-b lg:border-b-0 flex flex-col">
          
          {/* Header Switcher */}
          <div className="p-4 lg:p-6 border-b flex justify-between items-center bg-gray-100">
             <h2 className="text-xl lg:text-2xl font-bold">
               {sidebarMode === 'schedule' ? 'Schedule' : 'Presets'}
             </h2>
             <button 
               onClick={() => setSidebarMode(sidebarMode === 'schedule' ? 'templates' : 'schedule')}
               className="text-sm font-bold text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
             >
               {sidebarMode === 'schedule' ? '📂 Manage Presets' : '← Back to Schedule'}
             </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 lg:space-y-4">
            
            {/* MODE: SCHEDULE LIST */}
            {sidebarMode === 'schedule' && (
              <>
                {localEvents.length === 0 && (
                  <div className="text-center text-gray-400 py-8">No events yet. Add one!</div>
                )}
                {localEvents.map(e => (
                  <div key={e.id} className="p-3 lg:p-4 bg-white rounded-xl shadow-sm border flex justify-between items-center group cursor-pointer hover:border-blue-300 transition-colors" onClick={() => handleEdit(e)}>
                    <div>
                      <div className="font-bold text-base lg:text-lg">{e.icon} {e.title}</div>
                      <div className="text-xs lg:text-sm text-gray-500">{e.startTime} - {e.endTime}</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {e.days.map(d => <span key={d} className="text-[10px] lg:text-xs bg-gray-200 px-1 rounded">{DAYS_OF_WEEK[d].substring(0,3)}</span>)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {/* Mobile explicit delete/edit, desktop relies on hover or click */}
                       <button onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }} className="p-2 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100">✕</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* MODE: TEMPLATES LIST */}
            {sidebarMode === 'templates' && (
              <>
                {templates.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    No saved presets yet.<br/>
                    <button onClick={() => setSidebarMode('schedule')} className="text-blue-500 underline mt-2">Go back to save one.</button>
                  </div>
                )}
                {templates.map(t => (
                  <div key={t.id} className="p-4 bg-white rounded-xl shadow-sm border flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.events.length} events</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => loadTemplate(t)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium text-sm hover:bg-green-200">Load</button>
                      <button onClick={() => deleteTemplate(t.id)} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-500">🗑️</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t bg-gray-100">
             {sidebarMode === 'schedule' ? (
               <div className="space-y-2">
                 
                 {/* Daily Magic Toggle */}
                 <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">✨ Show Daily Magic</span>
                    <button 
                      onClick={() => onToggleDailyMagic(!showDailyMagic)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${showDailyMagic ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${showDailyMagic ? 'left-7' : 'left-1'}`} />
                    </button>
                 </div>

                 {isNamingTemplate ? (
                   <div className="flex gap-2 animate-fade-in">
                     <input 
                       autoFocus
                       type="text" 
                       placeholder="Preset Name..." 
                       value={newTemplateName}
                       onChange={e => setNewTemplateName(e.target.value)}
                       className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                     <button onClick={saveTemplate} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold">Save</button>
                     <button onClick={() => setIsNamingTemplate(false)} className="text-gray-500 px-2">✕</button>
                   </div>
                 ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={() => { setEditingId(null); setFormData(emptyEvent); }}
                           className="py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition shadow-md"
                         >
                           + New Event
                         </button>
                         <button 
                           onClick={() => setIsNamingTemplate(true)}
                           className="py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                         >
                           💾 Save Preset
                         </button>
                      </div>
                      <button 
                        onClick={() => { onSave(localEvents); onClose(); }}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-md mt-2"
                      >
                        ✅ Save & Exit
                      </button>
                    </>
                 )}
               </div>
             ) : (
               <button 
                  onClick={() => setSidebarMode('schedule')}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
               >
                 Cancel / Back
               </button>
             )}
          </div>
        </div>

        {/* --- RIGHT COLUMN (Form) --- */}
        <div className="w-full lg:w-2/3 p-4 lg:p-8 overflow-y-auto flex-1 bg-white relative">
          
          {/* Main Save/Cancel Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8 gap-4 border-b pb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {editingId ? 'Edit Event' : 'New Event'}
            </h2>
            <div className="space-x-4 w-full lg:w-auto flex justify-end">
               <button onClick={onClose} className="px-4 lg:px-6 py-2 text-gray-500 font-bold hover:text-gray-700">Close without Saving</button>
               <button 
                onClick={() => { onSave(localEvents); onClose(); }} 
                className="px-6 lg:px-8 py-2 bg-green-500 text-white rounded-full font-bold shadow-lg hover:bg-green-600 transform active:scale-95 transition-all"
               >
                 Apply Schedule
               </button>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-6 max-w-3xl mx-auto pb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 lg:p-4 text-lg lg:text-xl border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                placeholder="e.g. Lego Time"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Start Time</label>
                <input 
                  type="time" 
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full p-3 lg:p-4 text-lg lg:text-xl border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">End Time</label>
                <input 
                  type="time" 
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full p-3 lg:p-4 text-lg lg:text-xl border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(idx)}
                    className={`px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base rounded-full border-2 font-bold transition-all ${
                      formData.days.includes(idx) 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {day.substring(0,3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full shadow-sm ring-2 transition-all ${formData.color === c ? 'ring-offset-2 ring-gray-900 scale-110' : 'ring-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="relative w-8 h-8 lg:w-12 lg:h-12 rounded-full overflow-hidden shadow-sm ring-2 ring-gray-200 hover:ring-gray-400">
                     <input 
                        type="color" 
                        value={formData.color} 
                        onChange={e => setFormData({...formData, color: e.target.value})}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                     />
                  </div>
                </div>
               </div>
               <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Icon</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_ICONS.map(i => (
                    <button
                      key={i}
                      onClick={() => setFormData({...formData, icon: i})}
                      className={`w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center text-xl lg:text-2xl rounded-xl border-2 transition-all ${formData.icon === i ? 'bg-blue-50 border-blue-500 scale-110 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
               </div>
            </div>

            <div className="pt-4 lg:pt-8">
              <button 
                onClick={handleSaveForm}
                className="w-full py-3 lg:py-5 bg-black text-white rounded-2xl font-bold text-xl hover:bg-gray-800 transition shadow-lg transform active:scale-[0.99]"
              >
                {editingId ? 'Update Event Details' : 'Add to Schedule'}
              </button>
              {editingId && (
                 <button 
                   onClick={() => { setEditingId(null); setFormData(emptyEvent); }}
                   className="w-full mt-3 py-2 text-gray-500 font-semibold hover:text-gray-800"
                 >
                   Cancel Edit
                 </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
