import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

export type Plan = {
  id: string
  slug: string
  name: string
  price: number
  ram: string
  cpu: string
  storage: string
  icon: string
  featured: boolean
  sortOrder: number
  createdAt: string
}

export type User = {
  id: string
  email: string
  username: string
  passwordHash: string
  firstName: string
  middleName: string | null
  profileImage: string | null
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
  createdAt: string
  updatedAt: string
}

export type Server = {
  id: string
  userId: string
  planId: string
  serverName: string
  status: string
  createdAt: string
}

export type CartItem = {
  id: string
  userId: string
  planId: string
  quantity: number
  createdAt: string
}

export type TwoFactorCode = {
  id: string
  userId: string
  code: string
  expiresAt: string
  used: boolean
  createdAt: string
}

type StoreData = {
  users: User[]
  plans: Plan[]
  servers: Server[]
  cartItems: CartItem[]
  twoFactorCodes: TwoFactorCode[]
}

const DATA_DIR = path.join(process.cwd(), '.data')
const STORE_PATH = path.join(DATA_DIR, 'store.json')

const DEFAULT_PLANS: Omit<Plan, 'createdAt'>[] = [
  {
    id: 'plan_free',
    slug: 'free',
    name: 'Free',
    price: 0,
    ram: '6 GB',
    cpu: '4 vCPU',
    storage: '30 GB SSD',
    icon: 'dirt',
    featured: false,
    sortOrder: 0,
  },
  {
    id: 'plan_zombie',
    slug: 'zombie',
    name: 'Zombie',
    price: 600,
    ram: '12 GB',
    cpu: '6 vCPU',
    storage: '75 GB NVMe',
    icon: 'zombie',
    featured: false,
    sortOrder: 1,
  },
  {
    id: 'plan_wither',
    slug: 'wither',
    name: 'Wither',
    price: 1000,
    ram: '16 GB',
    cpu: '8 vCPU',
    storage: '100 GB NVMe',
    icon: 'wither',
    featured: false,
    sortOrder: 2,
  },
  {
    id: 'plan_ender_dragon',
    slug: 'ender-dragon',
    name: 'Ender Dragon',
    price: 1400,
    ram: '24 GB',
    cpu: '8 vCPU',
    storage: '150 GB NVMe',
    icon: 'ender-dragon',
    featured: true,
    sortOrder: 3,
  },
  {
    id: 'plan_diamond',
    slug: 'diamond',
    name: 'Diamond',
    price: 2600,
    ram: '48 GB',
    cpu: '12 vCPU',
    storage: '300 GB NVMe',
    icon: 'diamond',
    featured: false,
    sortOrder: 4,
  },
]

const globalStore = globalThis as unknown as {
  storeData?: StoreData
  storeWriteQueue?: Promise<void>
}

function now() {
  return new Date().toISOString()
}

function seedPlans(): Plan[] {
  const createdAt = now()
  return DEFAULT_PLANS.map((plan) => ({ ...plan, createdAt }))
}

async function readStore(): Promise<StoreData> {
  if (globalStore.storeData) return globalStore.storeData

  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as StoreData
    globalStore.storeData = parsed
    return parsed
  } catch {
    const empty: StoreData = {
      users: [],
      plans: seedPlans(),
      servers: [],
      cartItems: [],
      twoFactorCodes: [],
    }
    globalStore.storeData = empty
    await writeStore(empty)
    return empty
  }
}

async function writeStore(data: StoreData) {
  globalStore.storeData = data
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf8')
}

async function mutate(mutator: (data: StoreData) => void) {
  const run = async () => {
    const data = await readStore()
    mutator(data)
    await writeStore(data)
    return data
  }

  globalStore.storeWriteQueue = (globalStore.storeWriteQueue ?? Promise.resolve()).then(run).then(() => {})
  await globalStore.storeWriteQueue
  return readStore()
}

function matchWhere<T extends Record<string, unknown>>(
  item: T,
  where: Record<string, unknown>,
): boolean {
  return Object.entries(where).every(([key, value]) => {
    if (key === 'OR' && Array.isArray(value)) {
      return value.some((clause) => matchWhere(item, clause as Record<string, unknown>))
    }
    if (value && typeof value === 'object' && 'gt' in value) {
      const gt = (value as { gt: Date }).gt
      return new Date(String(item[key])) > gt
    }
    return item[key] === value
  })
}

function pick<T extends Record<string, unknown>, K extends keyof T>(
  item: T,
  select?: Record<K, boolean>,
): Partial<T> {
  if (!select) return item
  const result = {} as Partial<T>
  for (const key of Object.keys(select) as K[]) {
    if (select[key]) result[key] = item[key]
  }
  return result
}

function attachPlan(planId: string, plans: Plan[]) {
  return plans.find((p) => p.id === planId) ?? null
}

export const store = {
  user: {
    async findUnique({
      where,
      select,
    }: {
      where: Partial<Pick<User, 'id' | 'email' | 'username'>>
      select?: Record<string, boolean>
    }) {
      const data = await readStore()
      const user = data.users.find((u) => matchWhere(u, where)) ?? null
      return user ? (pick(user, select as never) as User) : null
    },

    async findFirst({ where }: { where: { OR: Partial<Pick<User, 'email' | 'username'>>[] } }) {
      const data = await readStore()
      return data.users.find((u) => matchWhere(u, where)) ?? null
    },

    async create({ data }: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }) {
      const user: User = {
        id: randomUUID(),
        createdAt: now(),
        updatedAt: now(),
        ...data,
      }
      await mutate((s) => {
        s.users.push(user)
      })
      return user
    },

    async update({
      where,
      data,
      select,
    }: {
      where: { id: string }
      data: Partial<User>
      select?: Record<string, boolean>
    }) {
      let updated: User | null = null
      await mutate((s) => {
        const idx = s.users.findIndex((u) => u.id === where.id)
        if (idx === -1) return
        s.users[idx] = { ...s.users[idx], ...data, updatedAt: now() }
        updated = s.users[idx]
      })
      if (!updated) throw new Error('User not found')
      return pick(updated, select as never) as User
    },
  },

  plan: {
    async findMany({ orderBy }: { orderBy?: { sortOrder: 'asc' | 'desc' } }) {
      const data = await readStore()
      const plans = [...data.plans]
      if (orderBy?.sortOrder === 'asc') {
        plans.sort((a, b) => a.sortOrder - b.sortOrder)
      }
      return plans
    },

    async findUnique({ where }: { where: { id?: string; slug?: string } }) {
      const data = await readStore()
      return data.plans.find((p) => matchWhere(p, where)) ?? null
    },
  },

  server: {
    async findMany({
      where,
      include,
      orderBy,
    }: {
      where?: { userId?: string }
      include?: { plan?: boolean }
      orderBy?: { createdAt: 'desc' | 'asc' }
    }) {
      const data = await readStore()
      let servers = where ? data.servers.filter((s) => matchWhere(s, where)) : data.servers
      if (orderBy?.createdAt === 'desc') {
        servers = [...servers].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      if (include?.plan) {
        return servers.map((s) => ({
          ...s,
          plan: attachPlan(s.planId, data.plans)!,
        }))
      }
      return servers
    },

    async create({
      data,
      include,
    }: {
      data: Omit<Server, 'id' | 'createdAt'>
      include?: { plan?: boolean }
    }) {
      const server: Server = {
        id: randomUUID(),
        createdAt: now(),
        ...data,
      }
      await mutate((s) => {
        s.servers.push(server)
      })
      const storeData = await readStore()
      if (include?.plan) {
        return { ...server, plan: attachPlan(server.planId, storeData.plans)! }
      }
      return server
    },
  },

  cartItem: {
    async findMany({
      where,
      include,
      orderBy,
    }: {
      where?: { userId?: string }
      include?: { plan?: boolean }
      orderBy?: { createdAt: 'desc' | 'asc' }
    }) {
      const data = await readStore()
      let items = where ? data.cartItems.filter((i) => matchWhere(i, where)) : data.cartItems
      if (orderBy?.createdAt === 'desc') {
        items = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      if (include?.plan) {
        return items.map((i) => ({
          ...i,
          plan: attachPlan(i.planId, data.plans)!,
        }))
      }
      return items
    },

    async upsert({
      where,
      update,
      create,
      include,
    }: {
      where: { userId_planId: { userId: string; planId: string } }
      update: Partial<CartItem>
      create: Omit<CartItem, 'id' | 'createdAt'>
      include?: { plan?: boolean }
    }) {
      const { userId, planId } = where.userId_planId
      let item: CartItem | null = null
      await mutate((s) => {
        const idx = s.cartItems.findIndex((i) => i.userId === userId && i.planId === planId)
        if (idx >= 0) {
          s.cartItems[idx] = { ...s.cartItems[idx], ...update }
          item = s.cartItems[idx]
        } else {
          item = {
            id: randomUUID(),
            createdAt: now(),
            ...create,
          }
          s.cartItems.push(item)
        }
      })
      const storeData = await readStore()
      if (include?.plan && item) {
        return { ...item, plan: attachPlan(item.planId, storeData.plans)! }
      }
      return item!
    },

    async deleteMany({ where }: { where: { userId?: string; planId?: string } }) {
      await mutate((s) => {
        s.cartItems = s.cartItems.filter((i) => !matchWhere(i, where))
      })
    },
  },

  twoFactorCode: {
    async findFirst({
      where,
      include,
    }: {
      where: {
        userId?: string
        code?: string
        used?: boolean
        expiresAt?: { gt: Date }
      }
      include?: { user?: boolean }
    }) {
      const data = await readStore()
      const record = data.twoFactorCodes.find((c) => matchWhere(c, where)) ?? null
      if (!record) return null
      if (include?.user) {
        const user = data.users.find((u) => u.id === record.userId)
        return user ? { ...record, user } : null
      }
      return record
    },

    async create({ data }: { data: Omit<TwoFactorCode, 'id' | 'createdAt' | 'used'> }) {
      const record: TwoFactorCode = {
        id: randomUUID(),
        createdAt: now(),
        used: false,
        ...data,
        expiresAt:
          data.expiresAt instanceof Date ? data.expiresAt.toISOString() : String(data.expiresAt),
      }
      await mutate((s) => {
        s.twoFactorCodes.push(record)
      })
      return record
    },

    async update({ where, data }: { where: { id: string }; data: Partial<TwoFactorCode> }) {
      await mutate((s) => {
        const idx = s.twoFactorCodes.findIndex((c) => c.id === where.id)
        if (idx >= 0) s.twoFactorCodes[idx] = { ...s.twoFactorCodes[idx], ...data }
      })
    },

    async updateMany({
      where,
      data,
    }: {
      where: { userId?: string; used?: boolean }
      data: Partial<TwoFactorCode>
    }) {
      await mutate((s) => {
        s.twoFactorCodes = s.twoFactorCodes.map((c) =>
          matchWhere(c, where) ? { ...c, ...data } : c,
        )
      })
    },
  },
}
