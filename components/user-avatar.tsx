import { cn } from '@/lib/utils'

type UserAvatarProps = {
  firstName?: string | null
  username?: string
  profileImage?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'size-8 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-16 text-xl',
}

function getInitials(firstName?: string | null, username?: string) {
  if (firstName) return firstName.charAt(0).toUpperCase()
  if (username) return username.charAt(0).toUpperCase()
  return '?'
}

export function UserAvatar({
  firstName,
  username,
  profileImage,
  size = 'md',
  className,
}: UserAvatarProps) {
  if (profileImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profileImage}
        alt=""
        className={cn(
          'rounded-full object-cover ring-2 ring-border',
          sizeMap[size],
          className,
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ring-2 ring-border',
        sizeMap[size],
        className,
      )}
    >
      {getInitials(firstName, username)}
    </span>
  )
}
