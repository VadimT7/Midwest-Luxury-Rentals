'use client'

import { useState, useEffect } from 'react'
import { Card } from '@valore/ui'
import { Button } from '@valore/ui'
import { Save, DollarSign, Globe, Mail, Building } from 'lucide-react'

interface Setting {
  id: string
  key: string
  value: string
  description?: string
  category: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form state
  const [paymentCurrency, setPaymentCurrency] = useState('CAD')
  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        
        // Update form state from settings
        data.forEach((setting: Setting) => {
          switch (setting.key) {
            case 'payment_currency':
              setPaymentCurrency(setting.value)
              break
            case 'company_name':
              setCompanyName(setting.value)
              break
            case 'company_email':
              setCompanyEmail(setting.value)
              break
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const settingsToUpdate = [
        { key: 'payment_currency', value: paymentCurrency },
        { key: 'company_name', value: companyName },
        { key: 'company_email', value: companyEmail }
      ]

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToUpdate })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        await fetchSettings() // Refresh settings
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">System Settings</h1>
        <p className="text-neutral-600 mt-2">Manage your application configuration</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Payment Settings</h2>
              <p className="text-sm text-neutral-600">Configure payment processing</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Payment Currency
              </label>
              <select
                value={paymentCurrency}
                onChange={(e) => setPaymentCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="USD">USD - US Dollar</option>
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                This currency will be used for all Stripe payment processing
              </p>
            </div>

          </div>
        </Card>

        {/* Company Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Company Information</h2>
              <p className="text-sm text-neutral-600">Basic company details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Company Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="info@company.com"
              />
            </div>
          </div>
        </Card>

        {/* Currency Information Card */}
        <Card className="p-6 lg:col-span-2 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <Globe className="h-6 w-6 text-amber-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Currency Configuration</h3>
              <p className="text-sm text-amber-700 mt-2">
                The selected currency (<strong>{paymentCurrency}</strong>) will be used for:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-700 mt-2 space-y-1">
                <li>All Stripe payment processing</li>
                <li>Payment intents and charges</li>
                <li>Refunds and adjustments</li>
                <li>Financial reporting in the admin dashboard</li>
              </ul>
              <p className="text-sm text-amber-700 mt-3">
                <strong>Note:</strong> The website will continue to display "$" for both CAD and USD. 
                Only the actual payment processing currency will change.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}