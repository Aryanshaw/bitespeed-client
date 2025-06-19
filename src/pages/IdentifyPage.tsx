import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Zap, Maximize2, Minimize2, Copy } from 'lucide-react';
import { identifyContact, checkHealth } from '@/services/api';

const formSchema = z.object({
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
}).refine((data) => data.email || data.phoneNumber, {
  message: "At least one field (email or phone number) is required",
  path: ["email"]
});

type FormData = z.infer<typeof formSchema>;

interface ContactResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: string[];
  };
}

export default function IdentifyPage() {
  const [response, setResponse] = useState<ContactResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    const performHealthCheck = async () => {
      try {
        const healthy = await checkHealth();
        setIsHealthy(healthy);
        if (healthy) {
          toast.success('Backend connected', {
            style: {
              backgroundColor: '#000000',
              border: '1px solid #10b981',
              color: '#10b981'
            }
          });
        } else {
          toast.error('Backend disconnected', {
            style: {
              backgroundColor: '#000000',
              border: '1px solid #ef4444',
              color: '#ef4444'
            }
          });
        }
      } catch (error) {
        setIsHealthy(false);
        toast.error('Backend disconnected', {
          style: {
            backgroundColor: '#000000',
            border: '1px solid #ef4444',
            color: '#ef4444'
          }
        });
      }
    };

    performHealthCheck();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!data.email && !data.phoneNumber) {
      toast.error('Please provide at least one field');
      return;
    }

    setIsLoading(true);
    try {
      const result = await identifyContact(data);
      setResponse(result);
      toast.success('Contact identified', {
        style: {
          backgroundColor: '#000000',
          border: '1px solid #10b981',
          color: '#10b981'
        }
      });
    } catch (error) {
      toast.error('Failed to identify contact', {
        style: {
          backgroundColor: '#000000',
          border: '1px solid #ef4444',
          color: '#ef4444'
        }
      });
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    reset();
    setResponse(null);
  };

  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
  };

  const handleCopyResponse = async () => {
    if (response) {
      try {
        await navigator.clipboard.writeText(formatJson(response));
        toast.success('Response copied to clipboard', {
          style: {
            backgroundColor: '#000000',
            border: '1px solid #10b981',
            color: '#10b981'
          }
        });
      } catch (error) {
        toast.error('Failed to copy response', {
          style: {
            backgroundColor: '#000000',
            border: '1px solid #ef4444',
            color: '#ef4444'
          }
        });
      }
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Minimal Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-orange-400" />
            <h1 className="text-xl font-medium text-white">Contact Identifier</h1>
          </div>
          {isHealthy !== null && (
            <div className="flex items-center justify-center">
              {isHealthy ? (
                <div className="flex items-center gap-1 text-green-400 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  Connected
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400 text-xs">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  Disconnected
                </div>
              )}
            </div>
          )}
        </div>

        {/* Single Card with Split Layout */}
        <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm overflow-hidden">
          <div className={`grid grid-cols-1 ${isExpanded ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} transition-all duration-300`}>
            {/* Left Side - Input Form */}
            <div className={`p-8 flex flex-col justify-center ${isExpanded ? 'lg:max-w-md lg:mx-auto' : ''}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Label htmlFor="email" className="text-gray-300 text-sm font-normal">
                        Email address
                      </Label>
                      <span className="text-orange-400/60 text-xs">optional</span>
                    </div>
                    <Input
                      id="email"
                      {...register('email')}
                      type="email"
                      placeholder="user@example.com"
                      className="bg-black/40 border-gray-700/50 text-white placeholder:text-gray-600 focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/20 h-11 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Label htmlFor="phoneNumber" className="text-gray-300 text-sm font-normal">
                        Phone number
                      </Label>
                      <span className="text-orange-400/60 text-xs">optional</span>
                    </div>
                    <Input
                      id="phoneNumber"
                      {...register('phoneNumber')}
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="bg-black/40 border-gray-700/50 text-white placeholder:text-gray-600 focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/20 h-11 transition-all duration-200"
                    />
                  </div>
                </div>

                {errors.email && (
                  <p className="text-red-400/80 text-xs">
                    {errors.email.message}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-11 font-normal transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Identify Contact
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 h-11 px-4 transition-all duration-200"
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Side - Response */}
            <div className={`relative p-8 flex flex-col border-l lg:border-l-gray-800/50 border-l-0 border-t lg:border-t-0 border-t-gray-800/50 transition-all duration-300 ${
              isExpanded ? 'lg:border-l-0 lg:border-t lg:border-t-gray-800/50' : ''
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 text-sm font-normal">Response</h3>
                <div className="flex items-center gap-2">
                  {response && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyResponse}
                        className="text-gray-400 hover:text-white hover:bg-gray-800/50 h-8 px-2 transition-all duration-200"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleExpanded}
                        className="text-gray-400 hover:text-white hover:bg-gray-800/50 h-8 px-2 transition-all duration-200"
                      >
                        {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                      </Button>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                        Contact Found
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${
                isExpanded ? 'min-h-[500px]' : 'min-h-[300px]'
              }`}>
                {response ? (
                  <div className="w-full h-full">
                    <div className="bg-black/60 rounded-lg border border-gray-800/50 h-full flex flex-col">
                      <div className="flex-1 overflow-auto">
                        <pre className="text-orange-400/90 text-sm font-mono whitespace-pre-wrap p-4 leading-relaxed min-h-full">
                          {formatJson(response)}
                        </pre>
                      </div>
                      {/* Resize handle */}
                      <div className="h-1 bg-gray-800/30 hover:bg-orange-400/20 cursor-ns-resize transition-colors duration-200 resize-y"></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/30 flex items-center justify-center">
                      <Search className="h-6 w-6 text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Enter contact details to identify
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}