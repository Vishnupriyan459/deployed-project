"use client"
import React from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Plus, Trash2, Shield, Building } from 'lucide-react'

const Page = () => {
    const [roles, setRoles] = React.useState<{ id: string, name: string }[]>([]);
    const [departments, setDepartments] = React.useState<{ id: string, name: string }[]>([]);
    const [newRole, setNewRole] = React.useState('');
    const [newDept, setNewDept] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        fetchRoles();
        fetchDepartments();
    }, []);

    async function fetchRoles() {
        const res = await fetch('/api/admin/roles');
        const json = await res.json();
        if (res.ok) {
            setRoles(json.roles);
        }
    }

    async function fetchDepartments() {
        const res = await fetch('/api/admin/departments');
        const json = await res.json();
        if (res.ok) {
            setDepartments(json.departments);
        }
    }

   const addRole = async () => {
    if (newRole.trim()) {
        setLoading(true);
        const res = await fetch('/api/admin/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newRole.trim() }),
        });
        const json = await res.json();
        if (res.ok) {
            await fetchRoles();  // Reload the entire roles list
            setNewRole('');
        } else {
            console.error('Invalid role response:', json);
        }
        setLoading(false);
    }
};



    const deleteRole = async (id: string) => {
        setLoading(true);
        const res = await fetch('/api/admin/roles', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            setRoles(prev => prev.filter(role => role.id !== id));
        }
        setLoading(false);
    };

    // const addDept = async () => {
    //     if (newDept.trim()) {
    //         setLoading(true);
    //         const res = await fetch('/api/admin/departments', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ name: newDept.trim() }),
    //         });
    //         const json = await res.json();
    //         if (res.ok) {
    //             setDepartments(prev => [...prev, json.department[0]]);
    //             setNewDept('');
    //         }
    //         setLoading(false);
    //     }
    // };
const addDept = async () => {
    if (newDept.trim()) {
        setLoading(true);
        const res = await fetch('/api/admin/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newDept.trim() }),
        });
        const json = await res.json();
        if (res.ok) {
            await fetchDepartments();  // Reload the entire departments list
            setNewDept('');
        } else {
            console.error('Invalid department response:', json);
        }
        setLoading(false);
    }
};


    const deleteDept = async (id: string) => {
        setLoading(true);
        const res = await fetch('/api/admin/departments', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            setDepartments(prev => prev.filter(dept => dept.id !== id));
        }
        setLoading(false);
    };

    const handleRoleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') addRole();
    };

    const handleDeptKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') addDept();
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Roles Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                <h2 className="text-xl sm:text-2xl font-bold text-white">User Roles</h2>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        onKeyPress={handleRoleKeyPress}
                                        placeholder="Enter role name"
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 placeholder-gray-400"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={addRole}
                                        disabled={!newRole.trim() || loading}
                                        className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Role
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {roles.map(role => (
                                    <div key={role.id} className="group flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <Shield className="w-4 h-4 text-blue-600" />
                                            <span className="font-medium text-gray-800 truncate">{role.name}</span>
                                        </div>
                                        <button
                                            onClick={() => deleteRole(role.id)}
                                            disabled={loading}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete role"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {roles.length === 0 && (
                                <div className="text-center py-8">
                                    <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No roles configured</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Departments Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <Building className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                <h2 className="text-xl sm:text-2xl font-bold text-white">Departments</h2>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={newDept}
                                        onChange={(e) => setNewDept(e.target.value)}
                                        onKeyPress={handleDeptKeyPress}
                                        placeholder="Enter department name"
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-700 placeholder-gray-400"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={addDept}
                                        disabled={!newDept.trim() || loading}
                                        className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Dept
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {departments.map(dept => (
                                    <div key={dept.id} className="group flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <Building className="w-4 h-4 text-emerald-600" />
                                            <span className="font-medium text-gray-800 truncate">{dept.name}</span>
                                        </div>
                                        <button
                                            onClick={() => deleteDept(dept.id)}
                                            disabled={loading}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete department"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {departments.length === 0 && (
                                <div className="text-center py-8">
                                    <Building className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No departments configured</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Page;
