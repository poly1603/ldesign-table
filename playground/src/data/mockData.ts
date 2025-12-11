/**
 * 模拟数据生成
 */

export interface User {
  id: number
  name: string
  age: number
  email: string
  phone: string
  address: string
  city: string
  country: string
  status: 'active' | 'inactive' | 'pending'
  role: 'admin' | 'user' | 'guest'
  createdAt: string
  avatar: string
}

const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡']
const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '艳', '勇', '杰', '涛']
const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆']
const countries = ['中国']
const statuses: User['status'][] = ['active', 'inactive', 'pending']
const roles: User['role'][] = ['admin', 'user', 'guest']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePhone(): string {
  return `1${Math.floor(Math.random() * 9) + 3}${Array(9).fill(0).map(() => Math.floor(Math.random() * 10)).join('')}`
}

function generateEmail(name: string): string {
  const domains = ['qq.com', '163.com', 'gmail.com', 'outlook.com', 'sina.com']
  return `${name.toLowerCase()}${Math.floor(Math.random() * 1000)}@${randomItem(domains)}`
}

function generateDate(): string {
  const start = new Date(2020, 0, 1)
  const end = new Date()
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

export function generateUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const name = firstName + lastName
    return {
      id: i + 1,
      name,
      age: Math.floor(Math.random() * 40) + 20,
      email: generateEmail(name),
      phone: generatePhone(),
      address: `${randomItem(cities)}市${randomItem(['朝阳', '海淀', '浦东', '天河', '南山'])}区${Math.floor(Math.random() * 100) + 1}号`,
      city: randomItem(cities),
      country: randomItem(countries),
      status: randomItem(statuses),
      role: randomItem(roles),
      createdAt: generateDate(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
    }
  })
}

// 预生成数据
export const users50 = generateUsers(50)
export const users100 = generateUsers(100)
export const users500 = generateUsers(500)
export const users1000 = generateUsers(1000)

// 列定义
export const basicColumns = [
  { key: 'id', title: 'ID', width: 80, align: 'center' as const },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'age', title: '年龄', width: 80, align: 'center' as const },
  { key: 'email', title: '邮箱', width: 200, ellipsis: true },
  { key: 'phone', title: '电话', width: 150 },
  { key: 'city', title: '城市', width: 100 },
  { key: 'status', title: '状态', width: 100, align: 'center' as const },
  { key: 'createdAt', title: '创建时间', width: 120 }
]

export const sortableColumns = basicColumns.map(col => ({
  ...col,
  sortable: ['age', 'createdAt', 'name'].includes(col.key)
}))

export const filterableColumns = basicColumns.map(col => ({
  ...col,
  filterable: ['status', 'city', 'role'].includes(col.key),
  filterOptions: col.key === 'status'
    ? [
      { label: '活跃', value: 'active' },
      { label: '未活跃', value: 'inactive' },
      { label: '待定', value: 'pending' }
    ]
    : col.key === 'city'
      ? cities.map(c => ({ label: c, value: c }))
      : col.key === 'role'
        ? [
          { label: '管理员', value: 'admin' },
          { label: '用户', value: 'user' },
          { label: '访客', value: 'guest' }
        ]
        : undefined
}))
