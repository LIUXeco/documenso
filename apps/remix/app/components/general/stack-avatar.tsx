import { RecipientStatusType } from '@documenso/lib/client-only/recipient-type';
import { Avatar, AvatarFallback } from '@documenso/ui/primitives/avatar';

const ZIndexes: { [key: string]: string } = {
  '10': 'z-10',
  '20': 'z-20',
  '30': 'z-30',
  '40': 'z-40',
  '50': 'z-50',
};

export type StackAvatarProps = {
  first?: boolean;
  zIndex?: string;
  fallbackText?: string;
  type: RecipientStatusType;
};

export const StackAvatar = ({ first, zIndex, fallbackText = '', type }: StackAvatarProps) => {
  let classes = '';
  let zIndexClass = '';
  const firstClass = first ? '' : '-ml-3';

  if (zIndex) {
    zIndexClass = ZIndexes[zIndex] ?? '';
  }

  switch (type) {
    case RecipientStatusType.UNSIGNED:
      classes = 'bg-[#C1C1C1] text-white';
      break;
    case RecipientStatusType.OPENED:
      classes = 'bg-[#FFC83E] text-white';
      break;
    case RecipientStatusType.WAITING:
      classes = 'bg-[#0073EC] text-white';
      break;
    case RecipientStatusType.COMPLETED:
      classes = 'bg-[#2F9B19] text-white';
      break;
    case RecipientStatusType.REJECTED:
      classes = 'bg-[#FD2828] text-white';
      break;
    default:
      break;
  }

  return (
    <Avatar
      className={` ${zIndexClass} ${firstClass} h-10 w-10 border-2 border-solid border-white dark:border-border`}
    >
      <AvatarFallback className={classes}>{fallbackText}</AvatarFallback>
    </Avatar>
  );
};
