import React, { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, Star } from 'lucide-react';

type Priority = 'High' | 'Medium' | 'Low';
type Status = 'New' | 'Contacted' | 'In Progress' | 'Resolved' | 'Closed';

interface Complaint {
  id: string;
  customerName: string;
  rating: number;
  category: string;
  date: string;
  priority: Priority;
  status: Status;
  description: string;
}

const INITIAL_COMPLAINTS: Complaint[] = [
  { id: 'c1', customerName: 'Alice Johnson', rating: 1, category: 'Food Quality', date: '2023-10-24T10:30:00Z', priority: 'High', status: 'New', description: 'Cold food and missing items in the delivery order.' },
  { id: 'c2', customerName: 'Bob Smith', rating: 2, category: 'Wait Time', date: '2023-10-24T09:15:00Z', priority: 'Medium', status: 'New', description: 'Order took 90 minutes to arrive, original estimate was 30 mins.' },
  { id: 'c3', customerName: 'Charlie Davis', rating: 2, category: 'Service', date: '2023-10-23T18:45:00Z', priority: 'Medium', status: 'Contacted', description: 'Rude delivery partner.' },
  { id: 'c4', customerName: 'Diana Prince', rating: 3, category: 'Pricing', date: '2023-10-22T14:20:00Z', priority: 'Low', status: 'In Progress', description: 'Charged extra for unreceived sauce packets.' },
  { id: 'c5', customerName: 'Evan Wright', rating: 1, category: 'App Issue', date: '2023-10-21T11:00:00Z', priority: 'High', status: 'Resolved', description: 'Could not apply promo code at checkout, resulting in full charge.' },
  { id: 'c6', customerName: 'Fiona Gallagher', rating: 2, category: 'Food Quality', date: '2023-10-20T19:30:00Z', priority: 'Medium', status: 'Closed', description: 'Soup spilled in the bag, ruined the packaging.' },
  { id: 'c7', customerName: 'George Washington', rating: 1, category: 'Wait Time', date: '2023-10-20T18:10:00Z', priority: 'High', status: 'Closed', description: 'Never received order.' }
];

const COLUMNS: Status[] = ['New', 'Contacted', 'In Progress', 'Resolved', 'Closed'];

export function RecoveryCenter() {
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'All' || c.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [complaints, searchQuery, filterPriority]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-100 text-rose-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Low': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
         <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recovery Center</h1>
          <p className="text-sm text-slate-500">Manage customer complaints and service recovery instances.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none xl:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search customers..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select
              className="appearance-none pl-10 pr-8 py-2 text-sm font-medium border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-sm"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | 'All')}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar -mx-2 px-2">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map(columnStatus => {
            const columnComplaints = filteredComplaints.filter(c => c.status === columnStatus);
            return (
              <div 
                key={columnStatus}
                className="w-80 flex flex-col bg-slate-50/80 border border-slate-200/60 rounded-xl"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, columnStatus)}
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-slate-200/60 flex items-center justify-between bg-slate-100/50 rounded-t-xl shrink-0">
                  <h3 className="font-semibold text-slate-700 text-sm">{columnStatus}</h3>
                  <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {columnComplaints.length}
                  </span>
                </div>
                
                {/* Column Body */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-[500px]">
                  {columnComplaints.map(complaint => (
                    <div 
                      key={complaint.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, complaint.id)}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-teal-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                          <div className="flex items-center text-amber-400">
                            <span className="text-xs font-medium mr-1 text-slate-600">{complaint.rating}</span>
                            <Star className="w-3 h-3 fill-current" />
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">{complaint.customerName}</h4>
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">{complaint.description}</p>
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                        <span className="bg-slate-50 px-2 py-1 rounded text-slate-600 border border-slate-100">{complaint.category}</span>
                        <span>{new Date(complaint.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                  
                  {columnComplaints.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-50 border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium">Drop items here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
