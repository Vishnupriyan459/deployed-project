"use client"

import DashboardLayout from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, Users, Building, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface User {
  id: string
  name: string
  email: string
  regNo: string
  department: string  // UUID
  role: string        // UUID
}

interface Option {
  id: string
  name: string
}

const Page = () => {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Option[]>([])
  const [roles, setRoles] = useState<Option[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)

  const [form, setForm] = useState<User>({
    id: '',
    name: "",
    email: "",
    regNo: "",
    department: "",
    role: ""
  })

  useEffect(() => {
    // Fetch roles and departments
    async function fetchOptions() {
      const res = await fetch('/api/admin/fetchoption')
      const result = await res.json()

      if (res.ok) {
        setDepartments(result.departments)
        setRoles(result.roles)

        // Set default values for form
        if (result.departments.length > 0) setForm(f => ({ ...f, department: result.departments[0].id }))
        if (result.roles.length > 0) setForm(f => ({ ...f, role: result.roles[0].id }))
      } else {
        console.error('Error fetching options:', result)
      }
    }

    // Fetch users
    async function fetchUsers() {
      const res = await fetch('/api/user/view_user')
      const result = await res.json()

      if (res.ok && Array.isArray(result.profiles)) {
        const transformed = result.profiles.map((profile: any) => ({
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          regNo: profile.register_no,
          department: profile.department_id,  // UUID
          role: profile.role_id              // UUID
        }))

        setUsers(transformed)
      } else {
        console.error('Error loading profiles:', result)
      }
    }

    fetchOptions()
    fetchUsers()
  }, [])

  async function handleCreateUser(form: User) {
    const res = await fetch('/api/user/create_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: 'password123',
        full_name: form.name,
        role: form.role,
        dept: form.department,
        register_no: form.regNo
      })
    })

    const data = await res.json()

    if (res.ok) {
      console.log('✅ User created:', data)
      setUsers(prev => [...prev, { ...form, id: data.id }])
    } else {
      console.error('❌ Failed to create user:', data.error)
    }
  }

  async function handleSaveUser() {
    if (editUser) {
      const res = await fetch('/api/user/update_user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editUser.id,
          full_name: form.name,
          email: form.email,
          role: form.role,
          dept: form.department,
          register_no: form.regNo
        })
      })

      const data = await res.json()

      if (res.ok) {
        console.log('✅ User updated:', data)
        setUsers(users.map(u => u.id === editUser.id ? { ...form, id: editUser.id } : u))
      } else {
        console.error('❌ Failed to update user:', data.error)
      }
    } else {
      await handleCreateUser(form)
    }

    setIsDialogOpen(false)
    setEditUser(null)
    setForm({
      id: '',
      name: "",
      email: "",
      regNo: "",
      department: departments[0]?.id || '',
      role: roles[0]?.id || ''
    })
  }

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/user/delete_user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })

    const data = await res.json()

    if (res.ok) {
      console.log('✅ User deleted:', data)
      setUsers(users.filter(u => u.id !== id))
    } else {
      console.error('❌ Failed to delete user:', data.error)
    }
  }

  const handleEdit = (user: User) => {
    setEditUser(user)
    setForm(user)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditUser(null)
    setForm({
      id: '',
      name: "",
      email: "",
      regNo: "",
      department: departments[0]?.id || '',
      role: roles[0]?.id || ''
    })
    setIsDialogOpen(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = departmentFilter === "all" || user.department === departmentFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesDept && matchesRole
  })

  const getNameById = (options: Option[], id: string) => {
    return options.find(o => o.id === id)?.name || 'Unknown'
  }

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6'>
        {/* Header Section */}
        <div className='flex items-center justify-between max-md:flex-col bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-slate-200/50'>
          <div className='flex items-center gap-4'>
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent'>
                User Management
              </h1>
              <p className="text-slate-600 mt-1">Smart Complaint Management System</p>
            </div>
          </div>
          <Button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New User
          </Button>
        </div>

        {/* Filters Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-slate-200/50">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <Search className="w-5 h-5 text-emerald-600" />
              Search & Filter Users
            </CardTitle>
            <CardDescription className="text-slate-600">
              Find users by name, department, or role
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users by name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-700"
                />
              </div>

              <div className="flex gap-3">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48 bg-slate-50/50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20">
                    <Building className="w-4 h-4 text-emerald-600 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <Shield className="w-4 h-4 text-blue-600 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/50">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <Users className="w-5 h-5 text-blue-600" />
              User Directory ({filteredUsers.length} users)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className='bg-gradient-to-r from-slate-100 to-blue-100/50'>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200/50">S.No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200/50">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200/50">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200/50">Reg No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200/50">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200/50">Role</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 border-b border-slate-200/50">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="w-12 h-12 text-slate-300" />
                          <p className="text-slate-500 text-lg font-medium">No users found</p>
                          <p className="text-slate-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 transition-all duration-200 group">
                        <td className="px-6 py-4 text-sm text-slate-600">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-mono">
                            {user.regNo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-slate-700">{getNameById(departments, user.department)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {getNameById(roles, user.role)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEdit(user)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDelete(user.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-2xl">
            <DialogHeader className="pb-4 border-b border-slate-200/50">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                {editUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <Input
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Registration Number</label>
                <Input
                  placeholder="Enter registration number"
                  value={form.regNo}
                  onChange={e => setForm(f => ({ ...f, regNo: e.target.value }))}
                  className="bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Department</label>
                <Select value={form.department} onValueChange={val => setForm(f => ({ ...f, department: val }))}>
                  <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <Select value={form.role} onValueChange={val => setForm(f => ({ ...f, role: val }))}>
                  <SelectTrigger className="bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-slate-200/50">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveUser}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {editUser ? "Update User" : "Add User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default Page