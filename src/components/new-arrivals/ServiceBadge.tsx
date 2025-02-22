
interface ServiceBadgeProps {
  service: string;
}

export const ServiceBadge = ({ service }: ServiceBadgeProps) => {
  const getServiceBadgeColor = (service: string) => {
    switch (service) {
      case 'personal-training':
        return 'bg-indigo-100 text-indigo-800';
      case 'coaching':
        return 'bg-purple-100 text-purple-800';
      case 'treatments':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case 'personal-training':
        return 'Personal Training';
      case 'coaching':
        return 'Coaching';
      case 'treatments':
        return 'Treatments';
      case 'others':
        return 'Others';
      default:
        return service;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceBadgeColor(service)}`}
    >
      {getServiceLabel(service)}
    </span>
  );
};
