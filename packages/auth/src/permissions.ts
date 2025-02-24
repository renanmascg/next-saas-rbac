import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'
import { Role } from './roles'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN: (user, { can, cannot }) => {
    can('manage', 'all')

    // por padrão, a partir do momento que dou permissão pra ele fazer TUDO dentro do CASL
    // as permissões de negação NÃO PODEM TER CONDICIONAIS!!
    // logo, a lógica mais simples abaixo não funcionaria
    // cannot('transfer_ownership', 'Organization', { ownerId: { $ne: user.id } })
    // semanticamente está correta, mas não funcionaria por uma questão do funcionamento
    // do CASL
    cannot(['transfer_ownership', 'update'], 'Organization')
    can(['transfer_ownership', 'update'], 'Organization', {
      ownerId: { $eq: user.id },
    })
  },
  MEMBER: (user, { can }) => {
    can('get', 'User')
    can(['create', 'get'], 'Project')
    can(['update', 'delete'], 'Project', { ownerId: { $eq: user.id } })
  },
  BILLING: (_, { can }) => {
    can('manage', 'Billing')
  },
}
