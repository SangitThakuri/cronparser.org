import type { ComponentType, LazyExoticComponent } from "react"

export interface RegistryEntry {
  id: string
  name: string
  description: string
  category: string
  icon: ComponentType<{ className?: string }>
  component: LazyExoticComponent<ComponentType>
}
