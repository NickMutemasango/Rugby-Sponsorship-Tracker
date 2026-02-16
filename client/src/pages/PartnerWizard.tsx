import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPartnerSchema, organizationTypes, partnershipNatures, teams } from "@shared/routes";
import { useCreatePartner } from "@/hooks/use-partners";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Organization", description: "Basic details" },
  { id: 2, title: "Partnership Interest", description: "Goals & Targets" },
  { id: 3, title: "Objectives", description: "Strategic Alignment" },
  { id: 4, title: "Compliance", description: "Rules & Regulations" },
];

export default function PartnerWizard() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const createPartner = useCreatePartner();

  const form = useForm({
    resolver: zodResolver(insertPartnerSchema),
    defaultValues: {
      organizationName: "",
      organizationTypes: [],
      countryOfRegistration: "",
      website: "",
      primaryContactName: "",
      primaryContactEmail: "",
      partnershipNature: "Commercial Sponsorship",
      teamsInterested: [],
      restrictedCategories: [],
      consentToContact: false,
      confidentialityAcknowledged: false,
      dataProtectionConsent: false,
    } as any
  });

  const onSubmit = (data: any) => {
    createPartner.mutate(data, {
      onSuccess: () => setLocation('/partners'),
    });
  };

  const nextStep = async () => {
    const fieldsToValidate = {
      1: ['organizationName', 'primaryContactName', 'primaryContactEmail', 'countryOfRegistration'],
      2: ['partnershipNature', 'teamsInterested'],
      3: [],
      4: ['consentToContact', 'confidentialityAcknowledged']
    }[step] || [];

    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold text-foreground">New Partner</h1>
          <p className="text-muted-foreground mt-1">Expression of Interest Form</p>
        </div>

        {/* Progress Steps */}
        <div className="relative flex justify-between mb-12">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2" />
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center bg-background px-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300",
                step >= s.id ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"
              )}>
                {step > s.id ? <Check className="w-5 h-5" /> : s.id}
              </div>
              <span className={cn(
                "mt-2 text-xs font-semibold uppercase tracking-wider",
                step >= s.id ? "text-primary" : "text-muted-foreground"
              )}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="organizationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="countryOfRegistration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country of Registration</FormLabel>
                              <FormControl><Input placeholder="Zimbabwe" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="organizationTypes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sector</FormLabel>
                              <Select onValueChange={(val) => field.onChange([val])} defaultValue={field.value?.[0]}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {organizationTypes.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="font-semibold text-foreground">Primary Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="primaryContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="primaryContactEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input type="email" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="partnershipNature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Nature of Interest</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select nature" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {partnershipNatures.map((t) => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teamsInterested"
                        render={() => (
                          <FormItem>
                            <FormLabel>Teams Interested</FormLabel>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {teams.map((team) => (
                                <FormField
                                  key={team}
                                  control={form.control}
                                  name="teamsInterested"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={team}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(team)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), team])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value: string) => value !== team
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm cursor-pointer">
                                          {team}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="successKpis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Success KPIs (What does success look like?)</FormLabel>
                            <FormControl><Textarea {...field} className="min-h-[120px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="additionalVision"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Vision</FormLabel>
                            <FormControl><Textarea {...field} className="min-h-[120px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-sm mb-6">
                        <h4 className="font-bold mb-2">Restricted Categories Notice</h4>
                        <p>ZRU adheres to World Rugby regulations. We cannot partner with organizations involved in betting, tobacco, high-alcohol beverages, or controversial political activities.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="confidentialityAcknowledged"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I acknowledge that all information provided will be treated confidentially.
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="consentToContact"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I consent to ZRU contacting me regarding this opportunity.
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={step === 1}
                  className="w-32"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {step < 4 ? (
                  <Button type="button" onClick={nextStep} className="w-32">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={createPartner.isPending} className="w-32">
                    {createPartner.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
