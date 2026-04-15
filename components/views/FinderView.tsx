import { useState } from 'react';
import { Search, MapPin, Building2, Users, Loader2, Plus, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectOption } from '@/components/ui/select';
import { Lead, LeadStatus } from '@/types';
import { cn } from '@/lib/utils';

interface FinderViewProps {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'remainingAmount' | 'paymentStatus'>) => void;
}

interface FoundLead {
  businessName: string;
  niche: string;
  city: string;
  contact: string;
  projectValue: number;
  notes: string;
}

const commonNiches = [
  'Restaurante', 'Dentista', 'Fotógrafo', 'Clínica Estética',
  'Advogado', 'Personal Trainer', 'Consultório Médico', 'Arquiteto',
  'Pizzaria', 'Barbearia', 'Academia', 'Pet Shop'
];

function isDuplicateLead(existingLeads: Lead[], businessName: string, city: string): boolean {
  return existingLeads.some(lead =>
    lead.businessName.toLowerCase() === businessName.toLowerCase() &&
    lead.city.toLowerCase() === city.toLowerCase()
  );
}

export function FinderView({ leads, addLead }: FinderViewProps) {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [limit, setLimit] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [foundLeads, setFoundLeads] = useState<FoundLead[]>([]);
  const [addedCount, setAddedCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!niche || !city) return;

    setIsSearching(true);
    setShowResults(false);
    setAddedCount(0);
    setDuplicateCount(0);

    try {
      const response = await fetch(`/api/search-leads?niche=${encodeURIComponent(niche)}&city=${encodeURIComponent(city)}&limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const results: FoundLead[] = await response.json();

      const newLeads: FoundLead[] = [];
      let duplicates = 0;

      results.forEach(lead => {
        if (isDuplicateLead(leads, lead.businessName, lead.city)) {
          duplicates++;
        } else {
          newLeads.push(lead);
        }
      });

      setFoundLeads(newLeads);
      setDuplicateCount(duplicates);
      setShowResults(true);
    } catch (error) {
      console.error('Error finding leads:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddAll = () => {
    let added = 0;

    foundLeads.forEach(foundLead => {
      if (!isDuplicateLead(leads, foundLead.businessName, foundLead.city)) {
        addLead({
          businessName: foundLead.businessName,
          niche: foundLead.niche,
          city: foundLead.city,
          contact: foundLead.contact,
          projectValue: foundLead.projectValue,
          amountReceived: 0,
          leadStatus: 'novo' as LeadStatus,
          notes: foundLead.notes
        });
        added++;
      }
    });

    setAddedCount(added);
    setFoundLeads([]);
    setShowResults(false);
  };

  const handleAddSingle = (foundLead: FoundLead) => {
    if (isDuplicateLead(leads, foundLead.businessName, foundLead.city)) {
      return;
    }

    addLead({
      businessName: foundLead.businessName,
      niche: foundLead.niche,
      city: foundLead.city,
      contact: foundLead.contact,
      projectValue: foundLead.projectValue,
      amountReceived: 0,
      leadStatus: 'novo' as LeadStatus,
      notes: foundLead.notes
    });

    setFoundLeads(prev => prev.filter(l => l.businessName !== foundLead.businessName));
    setAddedCount(prev => prev + 1);
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 pb-28 lg:pb-8">
      {/* Header - Premium */}
      <div className="mb-8 lg:mb-10">
        <h1 className="text-[28px] sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Buscar Leads</h1>
        <p className="text-slate-500 mt-2 text-base sm:text-lg">Encontre novos negócios por nicho e cidade</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* Search Card - Premium */}
          <Card className="border-0 shadow-card">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Search className="w-5 h-5 text-violet-600" />
                </div>
                Configurar Busca
              </CardTitle>
              <CardDescription className="text-sm">Preencha os critérios para encontrar leads</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Nicho *</label>
                  <Input
                    placeholder="Ex: Restaurante, Dentista, Fotógrafo..."
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="rounded-xl"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {commonNiches.map(n => (
                      <button
                        key={n}
                        onClick={() => setNiche(n)}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200",
                          niche === n
                            ? "bg-violet-100 text-violet-700"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Cidade *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Ex: São Paulo, Rio de Janeiro..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="pl-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Quantidade</label>
                  <Select value={limit.toString()} onChange={(e) => setLimit(Number(e.target.value))} className="rounded-xl">
                    <SelectOption value="3">3 leads</SelectOption>
                    <SelectOption value="5">5 leads</SelectOption>
                    <SelectOption value="10">10 leads</SelectOption>
                    <SelectOption value="15">15 leads</SelectOption>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={!niche || !city || isSearching}
                className="w-full gap-2 rounded-xl"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Buscando leads...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Buscar Leads
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card - Premium */}
          <div className={cn(
            "overflow-hidden transition-all duration-500 ease-out",
            showResults ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <Card className="border-0 shadow-card">
              <CardHeader className="p-5 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    Leads Encontrados
                    {foundLeads.length > 0 && (
                      <Badge variant="success" className="text-xs font-semibold">{foundLeads.length}</Badge>
                    )}
                  </div>
                  {foundLeads.length > 0 && (
                    <Button onClick={handleAddAll} size="sm" className="gap-2 rounded-xl">
                      <Plus className="w-4 h-4" />
                      Adicionar Todos
                    </Button>
                  )}
                </CardTitle>
                {duplicateCount > 0 && (
                  <CardDescription className="text-amber-600 text-sm">
                    {duplicateCount} lead(s) já existem no CRM e foram ignorados
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
                {foundLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                    </div>
                    <p className="text-slate-600 text-lg font-medium">Nenhum lead novo encontrado.</p>
                    <p className="text-slate-400 text-sm mt-2">
                      Tente outros termos ou verifique se já existem leads similares.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {foundLeads.map((foundLead, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                            <span className="text-white text-sm font-bold">{foundLead.businessName.charAt(0)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 text-sm truncate">{foundLead.businessName}</p>
                            <p className="text-sm text-slate-400">{foundLead.niche} • {foundLead.city}</p>
                            <p className="text-sm text-slate-400 truncate">{foundLead.contact}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-slate-500">
                                Valor sugerido: <span className="font-semibold text-slate-700">R$ {foundLead.projectValue.toLocaleString('pt-BR')}</span>
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-3 bg-white p-3 rounded-xl border border-slate-100">{foundLead.notes}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddSingle(foundLead)}
                          className="gap-2 rounded-xl w-full sm:w-auto"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Success Card - Premium */}
          <div className={cn(
            "overflow-hidden transition-all duration-500 ease-out",
            addedCount > 0 && !showResults ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <Card className="border-0 shadow-card bg-gradient-to-br from-emerald-50 to-teal-50/50">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-emerald-900 text-lg">{addedCount} lead(s) adicionado(s) com sucesso!</p>
                    <p className="text-sm text-emerald-700">Os leads foram salvos no CRM e estão disponíveis na seção Leads.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar - Premium */}
        <div className="space-y-5 sm:space-y-6">
          <Card className="border-0 shadow-card">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                </div>
                Como usar
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6 space-y-4">
              {[
                'Escolha um nicho (ex: Restaurante, Dentista)',
                'Informe a cidade de busca',
                'Clique em "Buscar Leads"',
                'Adicione os leads encontrados ao CRM'
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-600">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-to-br from-blue-50 to-cyan-50/50">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">API Google Places</p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Busca negócios reais via API. Resultados limitados pela quota gratuita.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader className="p-5 sm:p-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total de Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6 sm:px-6 sm:pb-6">
              <p className="text-4xl font-bold text-slate-900 tracking-tight">{leads.length}</p>
              <p className="text-sm text-slate-400 mt-1">Leads cadastrados no CRM</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
