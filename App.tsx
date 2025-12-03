
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Info, Play, Plus, ChevronDown, Folder, BookOpen } from 'lucide-react';
import { INITIAL_PROJECTS, MOCK_USERS } from './constants';
import { Project, ProjectFormData, ProjectStatus, User, UserRole, AppSettings, ChangeLogEntry, Category } from './types';
import { ProjectModal } from './components/ProjectModal';
import { ProjectDetailView } from './components/ProjectDetailView';
import { Row } from './components/Row';
import { SettingsView } from './components/SettingsView';
import { ResourceView } from './components/ResourceView';
import { SOPView } from './components/SOPView';

const App = () => {
  // Auth State - Default to Admin User immediately to bypass login
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  // Users State for RBAC Management
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    accentColor: '#E50914', // Default Netflix Red
    reduceMotion: false,
    enableNotifications: true,
  });

  // Data State
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null);
  const [selectedResourceName, setSelectedResourceName] = useState<string | null>(null);
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null);
  
  // User Preference State
  const [myList, setMyList] = useState<string[]>([]);
  const [likedProjects, setLikedProjects] = useState<string[]>([]);
  
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<Category>('Home');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll for navbar transparency and Featured App Rotation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    // Initialize Featured Project
    const apps = projects.filter(p => p.itemType === 'app');
    if (apps.length > 0 && !featuredProject) {
      const random = apps[Math.floor(Math.random() * apps.length)];
      setFeaturedProject(random);
    }

    // Auto-Rotate Featured Project every 2 minutes (120,000 ms)
    const rotationInterval = setInterval(() => {
      const currentApps = projects.filter(p => p.itemType === 'app');
      if (currentApps.length > 0) {
        const randomIndex = Math.floor(Math.random() * currentApps.length);
        setFeaturedProject(currentApps[randomIndex]);
      }
    }, 120000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(rotationInterval);
    };
  }, [projects]); // Re-run if project list changes to ensure we rotate through new apps

  // Filter projects based on search query AND active category
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // 1. Filter by Category
    if (activeCategory === 'Home') {
       filtered = filtered.filter(p => p.itemType === 'app');
    } else if (activeCategory === 'Resources') {
      filtered = filtered.filter(p => p.itemType === 'file');
    } else if (activeCategory === 'My List') {
      filtered = filtered.filter(p => myList.includes(p.id));
    } else if (activeCategory === 'FETS Apps') {
      filtered = filtered.filter(p => 
        p.itemType === 'app' &&
        p.techStack.some(t => ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'HTML', 'Node'].some(k => t.includes(k)))
      );
    }
    // Note: Mobile, Libraries, Deployed removed from main nav logic as per request.
    
    // 2. Filter by Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = projects.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.techStack.some(tech => tech.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }, [projects, searchQuery, activeCategory, myList]);

  // Group projects by status for rows
  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, Project[]> = {
      [ProjectStatus.IN_PROGRESS]: [],
      [ProjectStatus.COMPLETED]: [],
      [ProjectStatus.IDEA]: [],
      [ProjectStatus.ARCHIVED]: []
    };
    
    filteredProjects.forEach(p => {
      if (grouped[p.status]) {
        grouped[p.status].push(p);
      } else {
        if (!grouped['Other']) grouped['Other'] = [];
        grouped['Other'].push(p);
      }
    });
    return grouped;
  }, [filteredProjects]);

  // User Actions
  const toggleMyList = (id: string) => {
    setMyList(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleLike = (id: string) => {
    setLikedProjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteProject = (id: string) => {
     // Only allow delete through settings or for admin (permissions handled at call site)
     if (window.confirm("Are you sure you want to permanently delete this project?")) {
        setProjects(prev => prev.filter(p => p.id !== id));
        // Clean up selection if deleted
        if (selectedProject?.id === id) setSelectedProject(null);
        if (editingProject?.id === id) setEditingProject(undefined);
        if (featuredProject?.id === id) {
           const remaining = projects.filter(p => p.id !== id && p.itemType === 'app');
           setFeaturedProject(remaining.length > 0 ? remaining[0] : null);
        }
     }
  };

  // Handlers
  const handleCreateProject = (data: ProjectFormData) => {
    const newProject: Project = {
      id: Date.now().toString(),
      createdAt: data.createdAt || Date.now(),
      name: data.name,
      description: data.description,
      status: data.status,
      websiteUrl: data.websiteUrl,
      repoUrl: data.repoUrl,
      imageUrl: data.imageUrl,
      techStack: data.techStack.split(',').map(s => s.trim()).filter(Boolean),
      files: data.files,
      itemType: data.itemType,
      changeHistory: []
    };
    setProjects([newProject, ...projects]);
  };

  const handleUpdateProject = (data: ProjectFormData) => {
    if (!editingProject?.id) return;
    
    // Create Change Log Entry
    const newLog: ChangeLogEntry = {
      id: Date.now().toString(),
      date: Date.now(),
      author: currentUser?.name || 'Unknown',
      reason: data.changeReason || 'General update'
    };

    const updatedProjects = projects.map(p => {
      if (p.id === editingProject.id) {
        return {
          ...p,
          name: data.name,
          description: data.description,
          status: data.status,
          websiteUrl: data.websiteUrl,
          repoUrl: data.repoUrl,
          imageUrl: data.imageUrl,
          techStack: data.techStack.split(',').map(s => s.trim()).filter(Boolean),
          files: data.files,
          itemType: data.itemType,
          createdAt: data.createdAt || p.createdAt,
          changeHistory: [...(p.changeHistory || []), newLog]
        };
      }
      return p;
    });
    setProjects(updatedProjects);
  };

  // User Management Handlers
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to remove this user access?")) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const openCreateModal = () => {
    setEditingProject(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setSelectedProject(null); // Close detail view
  };

  const toggleSearch = () => {
    setIsSearchActive(prev => !prev);
    if (!isSearchActive) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const featuredImage = featuredProject?.imageUrl || (featuredProject ? `https://picsum.photos/seed/${featuredProject.id}/1920/1080` : '');

  // Helper for active link styling
  const getLinkClass = (category: Category) => 
    `cursor-pointer hover:text-white transition duration-300 relative group ${activeCategory === category ? 'text-white font-bold' : 'text-gray-400'}`;

  // Permissions
  const canCreate = currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.DEVELOPER);

  return (
    <div 
      className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-white selection:text-black overflow-x-hidden bg-grain"
    >
      {/* Dynamic Styles based on Settings */}
      <style>{`
        :root {
          --primary-color: ${appSettings.accentColor};
        }
      `}</style>
      
      {/* Navbar */}
      <nav 
        className={`fixed w-full z-[50] transition-all duration-700 ${isScrolled ? 'bg-black/80 backdrop-blur-lg shadow-xl border-b border-white/5' : 'bg-gradient-to-b from-black via-black/50 to-transparent'}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="px-4 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            {/* App Name */}
            <div 
              className="cursor-pointer hover:opacity-90 transition-opacity group"
              onClick={() => { setSearchQuery(''); setIsSearchActive(false); setActiveCategory('Home'); setSelectedResourceName(null); setSelectedSopId(null); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveCategory('Home')}
            >
               <h1 className="font-['Orbitron'] text-2xl md:text-3xl font-black tracking-widest drop-shadow-lg bg-gradient-to-r from-[var(--primary-color)] to-purple-600 bg-clip-text text-transparent">
                FETS HUB
               </h1>
            </div>
            
            {/* Menu Links (Hidden on mobile) */}
            <ul className="hidden lg:flex gap-6 text-sm font-medium tracking-wide">
              
              {/* Resources Dropdown */}
              <li 
                className={`relative group ${getLinkClass('Resources')} flex items-center gap-1`} 
                onClick={() => { setActiveCategory('Resources'); setSelectedResourceName(null); setSelectedSopId(null); }}
                role="button"
                tabIndex={0}
              >
                Resources
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                
                <div className="absolute top-full left-0 mt-4 w-56 bg-[#0a0a0a] border border-[#333] rounded shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-color)]"></div>
                  {['Prometric', 'Pearson VUE', 'PSI', 'FETS'].map(res => (
                    <button
                      key={res}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategory('Resources');
                        setSelectedResourceName(res);
                        setSelectedSopId(null);
                      }}
                      className="block w-full text-left px-5 py-3 text-sm text-gray-400 hover:text-white hover:bg-[#1f1f1f] transition-colors border-b border-[#1f1f1f] last:border-0"
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </li>

              {/* FETS Apps Dropdown */}
              <li 
                className={`relative group ${getLinkClass('FETS Apps')} flex items-center gap-1`} 
                onClick={() => { setActiveCategory('FETS Apps'); setSelectedSopId(null); }}
                role="button"
                tabIndex={0}
              >
                FETS Apps
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                
                <div className="absolute top-full left-0 mt-4 w-56 bg-[#0a0a0a] border border-[#333] rounded shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-color)]"></div>
                  {['fets.live', 'fets.cash', 'fets.team', 'fets.cloud', 'fets.hub'].map(app => (
                    <button
                      key={app}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (app === 'fets.hub') {
                          setActiveCategory('Home');
                        } else {
                          window.open(`https://${app}`, '_blank');
                        }
                      }}
                      className="block w-full text-left px-5 py-3 text-sm text-gray-400 hover:text-white hover:bg-[#1f1f1f] transition-colors border-b border-[#1f1f1f] last:border-0 font-mono lowercase"
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </li>

              {/* SOP Dropdown (NEW) */}
              <li 
                className={`relative group ${getLinkClass('SOP')} flex items-center gap-1`} 
                onClick={() => { setActiveCategory('SOP'); setSelectedSopId('overview'); setSelectedResourceName(null); }}
                role="button"
                tabIndex={0}
              >
                Standard Operation Procedures SOP
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                
                <div className="absolute top-full left-0 mt-4 w-64 bg-[#0a0a0a] border border-[#333] rounded shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-color)]"></div>
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'opening', label: 'Branch Opening' },
                    { id: 'checkin', label: 'Candidate Check-In' },
                    { id: 'monitoring', label: 'Exam Monitoring' },
                    { id: 'emergency', label: 'Emergency & Incident' },
                    { id: 'closing', label: 'End-of-Day Closing' },
                    { id: 'compliance', label: 'Compliance & Penalties' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategory('SOP');
                        setSelectedSopId(item.id);
                        setSelectedResourceName(null);
                      }}
                      className="block w-full text-left px-5 py-3 text-sm text-gray-400 hover:text-white hover:bg-[#1f1f1f] transition-colors border-b border-[#1f1f1f] last:border-0"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </li>

            </ul>
          </div>

          <div className="flex items-center gap-6 text-white">
            
            {/* Search Bar */}
            <div className={`flex items-center transition-all duration-500 ${isSearchActive ? 'bg-white/10 border border-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm' : 'px-2 py-1 border border-transparent'}`}>
              <button onClick={toggleSearch} aria-label="Search">
                <Search size={20} className="cursor-pointer hover:text-white text-gray-300 transition-colors" aria-hidden="true" />
              </button>
              <input 
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => !searchQuery && setIsSearchActive(false)}
                placeholder="Search projects..."
                aria-label="Search input"
                className={`bg-transparent text-white text-sm ml-2 focus:outline-none transition-all duration-500 placeholder-gray-400 ${isSearchActive ? 'w-32 md:w-64 opacity-100' : 'w-0 opacity-0'}`}
              />
            </div>

            {canCreate && (
              <button 
                onClick={openCreateModal} 
                className="hidden md:flex items-center gap-2 text-xs font-bold bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-sm transition-all uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                aria-label="Create New Build"
              >
                 <Plus size={16} aria-hidden="true" /> New Build
              </button>
            )}

          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {activeCategory === 'SOP' && selectedSopId ? (
          <SOPView sopId={selectedSopId} onBack={() => { setActiveCategory('Home'); setSelectedSopId(null); }} />
      ) : activeCategory === 'Resources' && selectedResourceName ? (
         <ResourceView resourceId={selectedResourceName} onBack={() => setSelectedResourceName(null)} />
      ) : (
        <>
          {/* Billboard (Hero Section) */}
          {featuredProject && !searchQuery && activeCategory === 'Home' && (
            <div className="relative h-[70vh] md:h-[90vh] w-full bg-black animate-in fade-in duration-1000 border-b border-white/5">
              <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => setSelectedProject(featuredProject)}
                role="button"
                aria-label={`View details for ${featuredProject.name}`}
              >
                <img 
                  key={featuredProject.id} 
                  src={featuredImage}
                  alt={`Hero image for ${featuredProject.name}`} 
                  className="w-full h-full object-cover grayscale-[40%] brightness-[0.65] animate-in fade-in duration-1000 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
              </div>

              <div className="absolute top-[30%] md:top-[35%] left-4 md:left-16 max-w-3xl space-y-6 z-10 pointer-events-none">
                <div className="flex items-center gap-3 mb-4 pointer-events-auto">
                    <div className="px-4 py-1.5 border border-white/20 flex items-center justify-center rounded-sm font-bold text-[10px] tracking-[0.2em] text-white/90 uppercase backdrop-blur-lg bg-white/5">Featured App</div>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--primary-color)] shadow-[0_0_10px_var(--primary-color)]"></span>
                      {featuredProject.status}
                    </span>
                </div>
                
                <h1 
                  className="text-5xl md:text-7xl font-black drop-shadow-2xl tracking-tighter text-white leading-[0.9] uppercase pointer-events-auto cursor-pointer"
                  onClick={() => setSelectedProject(featuredProject)}
                >
                  {featuredProject.name}
                </h1>
                
                <div className="flex items-center gap-4 text-gray-300 font-medium text-sm pointer-events-auto">
                    <span className="text-gray-400">{new Date(featuredProject.createdAt).getFullYear()}</span>
                    <span className="border border-gray-600 px-2 py-0.5 text-[10px] text-gray-300 uppercase tracking-wider bg-black/50 rounded">{featuredProject.techStack[0] || 'Tech'}</span>
                    {featuredProject.itemType === 'app' && <span className="border border-gray-600 px-2 py-0.5 text-[10px] text-gray-300 uppercase tracking-wider bg-black/50 rounded">HD</span>}
                </div>
                
                <p className="text-lg md:text-xl text-gray-200 drop-shadow-lg line-clamp-3 font-light leading-relaxed max-w-xl text-shadow-sm pointer-events-auto">
                  {featuredProject.description}
                </p>
                
                <div className="flex items-center gap-4 pt-6 pointer-events-auto">
                    <button 
                      onClick={() => featuredProject.websiteUrl ? window.open(featuredProject.websiteUrl, '_blank') : setSelectedProject(featuredProject)}
                      className="bg-white text-black px-8 md:px-10 py-3 rounded-sm flex items-center gap-3 font-bold hover:bg-gray-200 transition shadow-[0_0_30px_rgba(255,255,255,0.3)] uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] group"
                      aria-label="Launch featured project"
                    >
                      <Play fill="black" size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                      <span>Launch</span>
                    </button>
                    <button 
                      onClick={() => setSelectedProject(featuredProject)}
                      className="bg-gray-600/60 text-white px-8 md:px-10 py-3 rounded-sm flex items-center gap-3 font-bold hover:bg-gray-600/80 transition backdrop-blur-md uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="View details of featured project"
                    >
                      <Info size={22} aria-hidden="true" />
                      <span>Details</span>
                    </button>
                </div>
              </div>
            </div>
          )}

          {/* Category / Search Header */}
          {(searchQuery || activeCategory !== 'Home') && (
            <div className="pt-32 px-4 md:px-12 mb-8 animate-in fade-in">
              <h2 className="text-white text-3xl font-bold flex items-center gap-3 tracking-tight">
                {activeCategory === 'Resources' && <Folder size={32} className="text-gray-400" aria-hidden="true" />}
                {searchQuery ? `Results for "${searchQuery}"` : activeCategory}
              </h2>
              {!searchQuery && (
                <p className="text-gray-500 text-sm mt-2 font-mono uppercase tracking-wider">
                    {filteredProjects.length} items found
                </p>
              )}
            </div>
          )}

          {/* Rows */}
          <div className={`pb-40 relative z-20 pl-4 md:pl-12 overflow-visible ${(!searchQuery && activeCategory === 'Home') ? '-mt-20 md:-mt-32' : 'mt-6'}`}>
            
            {/* My List Empty State */}
            {activeCategory === 'My List' && filteredProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Plus size={48} className="mb-4 text-gray-700" aria-hidden="true" />
                  <p className="text-lg uppercase tracking-widest">Your list is empty</p>
                  <p className="text-sm text-gray-600">Add projects or files to track them here.</p>
              </div>
            )}

            {/* Resources (Files) View */}
            {activeCategory === 'Resources' && filteredProjects.length > 0 && (
                <Row 
                  title="Documents & Files" 
                  projects={filteredProjects} 
                  onView={setSelectedProject}
                  myList={myList}
                  likedProjects={likedProjects}
                  onToggleLike={toggleLike}
                  onToggleList={toggleMyList}
                  currentUser={currentUser!}
                  onDelete={handleDeleteProject}
                  onEdit={openEditModal}
                />
            )}

            {/* Standard Dashboard Rows */}
            {activeCategory !== 'Resources' && (
              <>
                {projectsByStatus[ProjectStatus.COMPLETED].length > 0 && (
                    <Row 
                      title="Currently Deployed" 
                      projects={projectsByStatus[ProjectStatus.COMPLETED]} 
                      onView={setSelectedProject}
                      myList={myList}
                      likedProjects={likedProjects}
                      onToggleLike={toggleLike}
                      onToggleList={toggleMyList}
                      currentUser={currentUser!}
                      onDelete={handleDeleteProject}
                      onEdit={openEditModal}
                    />
                )}
                
                {projectsByStatus[ProjectStatus.IN_PROGRESS].length > 0 && (
                  <Row 
                    title="In Development" 
                    projects={projectsByStatus[ProjectStatus.IN_PROGRESS]} 
                    onView={setSelectedProject} 
                    myList={myList}
                    likedProjects={likedProjects}
                    onToggleLike={toggleLike}
                    onToggleList={toggleMyList}
                    currentUser={currentUser!}
                    onDelete={handleDeleteProject}
                    onEdit={openEditModal}
                  />
                )}
                
                {projectsByStatus[ProjectStatus.IDEA].length > 0 && (
                  <Row 
                    title="Concept Phase" 
                    projects={projectsByStatus[ProjectStatus.IDEA]} 
                    onView={setSelectedProject} 
                    myList={myList}
                    likedProjects={likedProjects}
                    onToggleLike={toggleLike}
                    onToggleList={toggleMyList}
                    currentUser={currentUser!}
                    onDelete={handleDeleteProject}
                    onEdit={openEditModal}
                  />
                )}

                {projectsByStatus[ProjectStatus.ARCHIVED].length > 0 && (
                  <Row 
                    title="Deprecated" 
                    projects={projectsByStatus[ProjectStatus.ARCHIVED]} 
                    onView={setSelectedProject} 
                    myList={myList}
                    likedProjects={likedProjects}
                    onToggleLike={toggleLike}
                    onToggleList={toggleMyList}
                    currentUser={currentUser!}
                    onDelete={handleDeleteProject}
                    onEdit={openEditModal}
                  />
                )}
                
                {projectsByStatus['Other']?.length > 0 && (
                  <Row 
                    title="Other Projects" 
                    projects={projectsByStatus['Other']} 
                    onView={setSelectedProject} 
                    myList={myList}
                    likedProjects={likedProjects}
                    onToggleLike={toggleLike}
                    onToggleList={toggleMyList}
                    currentUser={currentUser!}
                    onDelete={handleDeleteProject}
                    onEdit={openEditModal}
                  />
                )}
              </>
            )}

            {/* Empty State */}
            {filteredProjects.length === 0 && activeCategory !== 'My List' && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                <p className="uppercase tracking-widest">No items found</p>
              </div>
            )}

          </div>
        </>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateProject}
        currentUser={currentUser}
      />

      <ProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(undefined)}
        onSave={handleUpdateProject}
        initialData={editingProject}
        currentUser={currentUser}
      />

      <ProjectDetailView
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        isLiked={selectedProject ? likedProjects.includes(selectedProject.id) : false}
        isInList={selectedProject ? myList.includes(selectedProject.id) : false}
        onToggleLike={toggleLike}
        onToggleList={toggleMyList}
        onEdit={openEditModal}
        currentUser={currentUser}
      />

      <SettingsView
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser!}
        allUsers={users}
        allProjects={projects}
        settings={appSettings}
        onUpdateSettings={setAppSettings}
        onUpdateUserRole={handleUpdateUserRole}
        onDeleteUser={handleDeleteUser}
        onDeleteProject={handleDeleteProject}
      />
      
    </div>
  );
};

export default App;
