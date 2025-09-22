'use client'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/lib/utils'

const themes = [
  {
    value: 'light',
    label: 'Claro',
    icon: Sun,
    description: 'Tema claro e limpo',
    gradient: 'from-amber-400 to-orange-500'
  },
  {
    value: 'dark',
    label: 'Escuro',
    icon: Moon,
    description: 'Tema escuro premium',
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    value: 'system',
    label: 'Sistema',
    icon: Monitor,
    description: 'Segue o sistema',
    gradient: 'from-slate-500 to-slate-600'
  },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const currentTheme = themes.find(t => t.value === theme)

  return (
    <div className="relative">
      <Listbox value={theme} onChange={setTheme}>
        {({ open }) => (
            <>
              <Listbox.Button className="relative flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group">
                <motion.div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md bg-gradient-to-br',
                    currentTheme?.gradient || 'from-slate-500 to-slate-600'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentTheme && <currentTheme.icon className="w-4 h-4" />}
                </motion.div>

                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {currentTheme?.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Tema
                  </div>
                </div>

                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </Listbox.Button>

              <AnimatePresence>
                {open && (
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Listbox.Options className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-900/5 dark:ring-slate-700 focus:outline-none border border-slate-200 dark:border-slate-700">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Escolher Tema
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Selecione sua preferência de aparência
                          </p>
                        </div>

                        <div className="py-2">
                          {themes.map((themeOption, index) => (
                            <Listbox.Option
                              key={themeOption.value}
                              value={themeOption.value}
                              className="cursor-pointer"
                            >
                              {({ selected, active }) => (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className={cn(
                                    'flex items-center gap-3 px-3 py-3 mx-1 rounded-lg transition-all duration-200',
                                    active
                                      ? 'bg-slate-50 dark:bg-slate-700/50'
                                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30',
                                    selected && 'ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-900/10'
                                  )}
                                >
                                  <div className={cn(
                                    'w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm bg-gradient-to-br',
                                    themeOption.gradient
                                  )}>
                                    <themeOption.icon className="w-5 h-5" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {themeOption.label}
                                      </div>
                                      {selected && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                                        >
                                          <Check className="w-3 h-3 text-white" />
                                        </motion.div>
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {themeOption.description}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </Listbox.Option>
                          ))}
                        </div>
                      </div>
                    </Listbox.Options>
                  </Transition>
                )}
              </AnimatePresence>
            </>
        )}
      </Listbox>
    </div>
  )
}