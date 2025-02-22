
import { useCallback } from "react";
import { Users } from "lucide-react";
import { InviteClientDialog } from "@/components/dashboard/InviteClientDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients } from "@/components/clients/useClients";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientTable } from "@/components/clients/ClientTable";

const Clients = () => {
  const {
    clients,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    serviceFilter,
    setServiceFilter,
    selectedClientId,
    setSelectedClientId,
    fetchClients
  } = useClients();

  const filteredClients = clients.filter(client => {
    const matchesSearch = (
      (client.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    const matchesService = serviceFilter === 'all' || (
      (serviceFilter === 'nutrition' && client.hasNutritionPlan) ||
      (serviceFilter === 'training' && client.hasWorkoutPlan) ||
      (serviceFilter === 'personal-training' && client.hasPersonalTraining)
    );

    return matchesSearch && matchesStatus && matchesService;
  });

  const handleClientAdded = useCallback(() => {
    console.log("Refreshing clients list after adding new client");
    fetchClients();
  }, [fetchClients]);

  const handleProfileClose = useCallback(() => {
    setSelectedClientId(null);
    fetchClients();
  }, [setSelectedClientId, fetchClients]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-green-100/30 to-green-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">My Clients</h1>
            </div>
            <InviteClientDialog onClientAdded={handleClientAdded} />
          </div>

          <ClientFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            serviceFilter={serviceFilter}
            onServiceFilterChange={setServiceFilter}
          />

          <ScrollArea className="h-[calc(100vh-12rem)] w-full">
            <ClientTable
              clients={filteredClients}
              onClientSelected={setSelectedClientId}
              onClientUpdated={fetchClients}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Clients;

