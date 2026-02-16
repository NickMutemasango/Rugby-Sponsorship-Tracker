import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPartnerSchema, organizationTypes, partnershipNatures, teams } from "@shared/routes";
import { useCreatePartner } from "@/hooks/use-partners";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Organization" },
  { id: 2, title: "Partnership Interest" },
  { id: 3, title: "Objectives" },
  { id: 4, title: "Compliance" },
];

export default function PartnerWizard() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const createPartner = useCreatePartner();

  const form = useForm({
    resolver: zodResolver(insertPartnerSchema),
    defaultValues: {
      organizationName: "",
      organizationTypes: [] as string[],
      countryOfRegistration: "",
      website: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      primaryContactJobTitle: "",
      primaryContactLinkedin: "",
      partnershipNature: "Commercial Sponsorship" as any,
      teamsInterested: [] as string[],
      restrictedCategories: [] as string[],
      consentToContact: false,
      confidentialityAcknowledged: false,
      dataProtectionConsent: false,
      successKpis: "",
      additionalVision: "",
    },
  });

  const onSubmit = (data: any) => {
    createPartner.mutate(data, {
      onSuccess: () => setLocation("/partners"),
    });
  };

  const nextStep = async () => {
    const fieldsToValidate: Record<number, string[]> = {
      1: ["organizationName", "primaryContactName", "primaryContactEmail", "countryOfRegistration"],
      2: ["partnershipNature"],
      3: [],
      4: [],
    };
    const isValid = await form.trigger(fieldsToValidate[step] as any);
    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Partner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Expression of Interest Form
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold border transition-colors",
                  step > s.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : step === s.id
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground"
                )}
              >
                {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:inline",
                  step >= s.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 mx-2",
                    step > s.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* STEP 1: Organization */}
              {step === 1 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Acme Corp" {...field} data-testid="input-org-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="countryOfRegistration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input placeholder="Zimbabwe" {...field} data-testid="input-country" />
                          </FormControl>
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
                          <Select
                            onValueChange={(val) => field.onChange([val])}
                            defaultValue={field.value?.[0]}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-sector">
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

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} data-testid="input-website" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-5 space-y-4">
                    <h3 className="text-sm font-semibold">Primary Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-contact-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="primaryContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-contact-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="primaryContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-contact-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="primaryContactJobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-contact-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Partnership Interest */}
              {step === 2 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="partnershipNature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Nature of Interest *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-partnership-nature">
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
                        <FormLabel>Teams / Competitions Interested</FormLabel>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                          {teams.map((team) => (
                            <FormField
                              key={team}
                              control={form.control}
                              name="teamsInterested"
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(team)}
                                      onCheckedChange={(checked) =>
                                        checked
                                          ? field.onChange([...(field.value || []), team])
                                          : field.onChange(field.value?.filter((v: string) => v !== team))
                                      }
                                      data-testid={`checkbox-team-${team.replace(/\s+/g, '-').toLowerCase()}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer leading-none">
                                    {team}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 3: Objectives */}
              {step === 3 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="successKpis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Success KPIs</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What does success look like for this partnership?"
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-kpis"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalVision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Vision / Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share any additional thoughts or vision for the partnership..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-vision"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* STEP 4: Compliance */}
              {step === 4 && (
                <div className="space-y-5">
                  <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Restricted Categories Notice
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      ZRU adheres to World Rugby regulations. We cannot partner with
                      organizations involved in sports betting/gambling, tobacco,
                      high-alcohol beverages (&gt;5% ABV), or controversial political
                      activities.
                    </p>
                  </Card>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="confidentialityAcknowledged"
                      render={({ field }) => (
                        <FormItem className="flex items-start gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-confidentiality"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-snug cursor-pointer">
                            I acknowledge that all information provided will be treated
                            confidentially.
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dataProtectionConsent"
                      render={({ field }) => (
                        <FormItem className="flex items-start gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-data-protection"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-snug cursor-pointer">
                            I consent to ZRU processing my data in accordance with
                            applicable data protection laws.
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consentToContact"
                      render={({ field }) => (
                        <FormItem className="flex items-start gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-consent-contact"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-snug cursor-pointer">
                            I consent to ZRU contacting me regarding this opportunity.
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  data-testid="button-prev-step"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {step < STEPS.length ? (
                  <Button type="button" onClick={nextStep} data-testid="button-next-step">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={createPartner.isPending} data-testid="button-submit-partner">
                    {createPartner.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Submit
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
}
