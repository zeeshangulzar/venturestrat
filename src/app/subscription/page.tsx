'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import PageLoader from '@components/PageLoader';
import { useUserDataRefresh } from '../../contexts/UserDataContext';
import {
  createSubscriptionSetupIntent,
  fetchSubscription,
  updateSubscriptionPlan,
} from '@lib/api';
import { getStripe } from '@lib/stripeClient';
import { useUserCompany } from '@hooks/useUserCompany';

type SubscriptionResponse = {
  subscription: {
    plan: string;
    status?: string | null;
    currentPeriodEnd?: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
  };
  paymentMethod?: PaymentMethodSummary | null;
};

type PaymentMethodSummary = {
  id: string;
  brand: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
};

type PlanOption = {
  id: 'FREE' | 'STARTER' | 'PRO' | 'SCALE';
  name: string;
  price: string;
  headline: string;
  subheading: string;
  featureGroups: {
    title: string;
    items: string[];
  }[];
  badge?: string;
};

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0 / month',
    headline: '',
    subheading: '',
    featureGroups: [
      {
        title: 'Core Features',
        items: [
          'Add 25 investors to CRM per month',
          'Sending email 3/day',
          'AI drafts: up to 3/day',
        ],
      },
    ],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: '$69 / month',
    headline: '',
    subheading: '',
    badge: 'Starter',
    featureGroups: [
      {
        title: 'Core Features',
        items: [
          'Add 125 investors to CRM per month',
          'Send up to 125 emails/month',
          'AI drafts: up to 125/month',
        ],
      },
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$99 / month',
    headline: '',
    subheading: '',
    badge: 'Best value',
    featureGroups: [
      {
        title: 'Core Features',
        items: [
          'Add 500 investors to CRM per month',
          'Send up to 500 emails/month',
          'AI drafts: up to 500/month',
          'Auto follow-ups',
        ],
      },
    ],
  },
  {
    id: 'SCALE',
    name: 'Scale',
    price: '$179 / month',
    headline: '',
    subheading: '',
    featureGroups: [
      {
        title: 'Core Features',
        items: [
          'Add 1000 investors to CRM per month',
          'Send up to 1000 emails/month',
          'AI drafts: up to 1000/month',
          'Auto follow-up',
          'Fundraising Profile Assessment'
        ],
      },
    ],
  },
];

const formatPlanName = (plan?: string | null): string => {
  if (!plan) return 'Unknown';
  return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
};

type PaymentElementWrapperProps = {
  stripePromise: Promise<Stripe | null>;
  clientSecret: string;
  onReady: (stripe: Stripe | null, elements: StripeElements | null) => void;
  onElementReady: () => void;
};

const PaymentElementWrapper: React.FC<PaymentElementWrapperProps> = ({
  stripePromise,
  clientSecret,
  onReady,
  onElementReady,
}) => (
  <Elements
    stripe={stripePromise}
    options={{
      clientSecret,
      appearance: { theme: 'stripe' },
    }}
    key={clientSecret}
  >
    <StripePaymentElement onReady={onReady} onElementReady={onElementReady} />
  </Elements>
);

const StripePaymentElement: React.FC<{
  onReady: (stripe: Stripe | null, elements: StripeElements | null) => void;
  onElementReady: () => void;
}> = ({ onReady, onElementReady }) => {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (stripe && elements) {
      onReady(stripe, elements);
    }
  }, [stripe, elements, onReady]);

  return (
    <PaymentElement
      onReady={onElementReady}
      options={{
        layout: 'accordion',
        business: { name: 'VentureStrat' },
        wallets: {
          // @ts-ignore - Link is supported but not in types yet
          link: 'never',
        },
      }}
    />
  );
};

type PlanManagerProps = {
  stripePromise: Promise<Stripe | null> | null;
};

const planRequiresPayment = (plan: 'FREE' | 'STARTER' | 'PRO' | 'SCALE' | null): boolean =>
  Boolean(plan && plan !== 'FREE');

const PlanManager: React.FC<PlanManagerProps> = ({ stripePromise }) => {
  const { user, isLoaded } = useUser();
  const { triggerRefresh } = useUserDataRefresh();

  const [subscription, setSubscription] =
    useState<SubscriptionResponse['subscription'] | null>(null);
  const [selectedPlan, setSelectedPlan] =
    useState<'FREE' | 'STARTER' | 'PRO' | 'SCALE' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodSummary | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStripe, setPaymentStripe] = useState<Stripe | null>(null);
  const [paymentElements, setPaymentElements] = useState<StripeElements | null>(null);
  const [isPreparingPaymentElement, setIsPreparingPaymentElement] = useState(false);
  const { isTrialExpired } = useUserCompany();
  const [cardFlow, setCardFlow] = useState<{ mode: 'plan'; targetPlan: 'FREE' | 'STARTER' | 'PRO' | 'SCALE' } | { mode: 'card' } | null>(null);

  const stripeEnabled = Boolean(stripePromise);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>(PLAN_OPTIONS);


  useEffect(() => {
    const loadSubscription = async () => {
      if (!user?.id) {
        return;
      }

      setIsFetching(true);
      setError(null);

      try {
        const response = (await fetchSubscription(user.id)) as SubscriptionResponse;
        setSubscription(response.subscription);
        setSelectedPlan(response.subscription.plan as 'FREE' | 'STARTER' | 'PRO' | 'SCALE');
        setPaymentMethod(response.paymentMethod ?? null);
      } catch (err) {
        console.error('Failed to fetch subscription', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscription');
      } finally {
        setIsFetching(false);
      }
    };

    if (isLoaded) {
      void loadSubscription();
    }
  }, [isLoaded, user?.id]);

  useEffect(() => {
    if (!subscription?.plan) return;

    const currentPlanId = subscription.plan.toUpperCase() as 'FREE' | 'STARTER' | 'PRO' | 'SCALE';

    setAvailablePlans(
      currentPlanId !== 'FREE'
        ? PLAN_OPTIONS.filter((plan) => plan.id !== 'FREE')
        : PLAN_OPTIONS
    );
  }, [subscription?.plan]);

  const currentPlanId = (subscription?.plan || 'FREE') as 'FREE' | 'STARTER' | 'PRO' | 'SCALE';
  const closeCardFlow = useCallback(() => {
    setCardFlow(null);
    setClientSecret(null);
    setPaymentStripe(null);
    setPaymentElements(null);
    setSelectedPlan(
      subscription?.plan
        ? (subscription.plan as 'FREE' | 'STARTER' |'PRO' | 'SCALE')
        : null
    );
  }, [subscription?.plan]);

  const prepareSetupIntent = useCallback(async () => {
    if (!user?.id) return;

    setIsPreparingPaymentElement(true);
    try {
      const response = await createSubscriptionSetupIntent(user.id);
      setClientSecret(response.clientSecret);
      // Keep isPreparingPaymentElement true until the PaymentElement is ready
    } catch (intentError) {
      console.error('Failed to create setup intent', intentError);
      setError(
        intentError instanceof Error ? intentError.message : 'Unable to prepare payment form'
      );
      closeCardFlow();
      setIsPreparingPaymentElement(false);
    }
  }, [closeCardFlow, user?.id]);

  useEffect(() => {
    if (!cardFlow) {
      return;
    }

    if (!stripeEnabled || !stripePromise) {
      return;
    }

    void prepareSetupIntent();
  }, [cardFlow, prepareSetupIntent, stripeEnabled, stripePromise]);

  const executePlanUpdate = useCallback(
    async (
      planId: 'FREE' | 'STARTER' | 'PRO' | 'SCALE',
      paymentMethodId?: string,
      successText?: string
    ) => {
      if (!user?.id) return;

      setActionLoading(true);
      try {
        const response = (await updateSubscriptionPlan(
          user.id,
          planId,
          paymentMethodId
        )) as SubscriptionResponse;

        setSubscription(response.subscription);
        setPaymentMethod(response.paymentMethod ?? null);
        setSelectedPlan(response.subscription.plan as 'FREE' | 'STARTER' | 'PRO' | 'SCALE');
        setSuccessMessage(
          successText ??
            `Subscription updated to the ${formatPlanName(response.subscription.plan)} plan.`
        );
        triggerRefresh();
      } catch (err) {
        console.error('Failed to update subscription', err);
        setError(err instanceof Error ? err.message : 'Failed to update subscription');
      } finally {
        setActionLoading(false);
      }
    },
    [triggerRefresh, user?.id]
  );

  const handlePlanChange = async (planId: 'FREE' | 'STARTER' | 'PRO' | 'SCALE') => {
    setError(null);
    setSuccessMessage(null);
    setSelectedPlan(planId);

    if (planId === currentPlanId) {
      return;
    }

    if (planRequiresPayment(planId)) {
      if (paymentMethod) {
        await executePlanUpdate(planId);
        return;
      }

      if (!stripeEnabled || !stripePromise) {
        setError('Stripe is not configured. Please contact support to upgrade.');
        return;
      }

      setClientSecret(null);
      setPaymentStripe(null);
      setPaymentElements(null);
      setCardFlow({ mode: 'plan', targetPlan: planId });
      return;
    }

    await executePlanUpdate(planId);
  };

  const handleCardFlowSubmit = async () => {
    if (!cardFlow) {
      return;
    }

    setActionLoading(true);

    if (!stripeEnabled || !stripePromise) {
      setError('Stripe is not configured. Please contact support to update your payment method.');
      setActionLoading(false);
      closeCardFlow();
      return;
    }

    if (!paymentStripe || !paymentElements) {
      setError('Secure payment form is still loading. Please wait a moment and try again.');
      setActionLoading(false);
      return;
    }

    const { error: confirmError, setupIntent } = await paymentStripe.confirmSetup({
      elements: paymentElements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Unable to confirm payment details');
      setActionLoading(false);
      return;
    }

    const status = setupIntent?.status;
    if (status !== 'succeeded' && status !== 'requires_action') {
      setError('Payment method confirmation was not successful. Please try again.');
      setActionLoading(false);
      return;
    }

    const paymentMethodId = setupIntent?.payment_method as string | undefined;

    if (!paymentMethodId) {
      setError('Payment method was not captured correctly.');
      setActionLoading(false);
      return;
    }

    const planId =
      cardFlow.mode === 'plan'
        ? cardFlow.targetPlan
        : ((subscription?.plan ?? 'FREE') as 'FREE' | 'STARTER' | 'PRO' | 'SCALE');

    await executePlanUpdate(
      planId,
      paymentMethodId,
      cardFlow.mode === 'card'
        ? 'Payment method updated successfully.'
        : undefined
    );
    closeCardFlow();
  };

  const handleChangeCard = () => {
    setError(null);
    setSuccessMessage(null);

    if (!stripeEnabled || !stripePromise) {
      setError('Stripe is not configured. Please contact support to update your payment method.');
      return;
    }

    setClientSecret(null);
    setPaymentStripe(null);
    setPaymentElements(null);
    setCardFlow({ mode: 'card' });
  };

  if (!isLoaded || isFetching) {
    return (
      <div className="flex h-[560px] items-center justify-center">
        <PageLoader message="Loading your subscription..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Subscription</h1>
        <p className="text-gray-600">Sign in to manage your subscription.</p>
      </div>
    );
  }

  const renderStatusPill = () => {
    const status = subscription?.status || 'unknown';
    const normalizedStatus = status.toLowerCase();
    const isActive = ['active', 'trialing'].includes(normalizedStatus);
    const isPastDue = ['past_due', 'incomplete', 'incomplete_expired'].includes(normalizedStatus);
    const planName = (subscription?.plan || '').toUpperCase();

    const baseClass =
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide';

    // Always treat Free plan as active
    if (planName === 'FREE') {
      return <span className={`${baseClass} bg-emerald-100 text-emerald-700`}>Active</span>;
    }

    if (isActive) {
      return <span className={`${baseClass} bg-emerald-100 text-emerald-700`}>Active</span>;
    }

    if (isPastDue) {
      return (
        <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>
          {status || 'Attention needed'}
        </span>
      );
    }

    // Default fallback: don't show 'unknown', show 'Inactive' or 'Active' for other nulls
    if (!status || normalizedStatus === 'unknown') {
      return <span className={`${baseClass} bg-gray-100 text-gray-700`}>Inactive</span>;
    }

    return <span className={`${baseClass} bg-gray-100 text-gray-700`}>{status || 'Inactive'}</span>;
  };

  const currentPeriodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
    : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-slate-900">Subscription</h1>
      </div>

      {(error || successMessage) && (
        <div className="mb-6 space-y-3">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {successMessage}
            </div>
          )}
        </div>
      )}

      {!stripeEnabled && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Stripe publishable key is not configured. Paid upgrades are disabled until Stripe is set up.
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Current plan</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-3xl font-semibold capitalize text-slate-900">
                  {formatPlanName(subscription?.plan)} plan
                </p>
                {renderStatusPill()}
              </div>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {subscription?.plan === "FREE" ? (
                  isTrialExpired ? (
                    <span className="text-red-600 font-medium">
                      Your trial has ended. Please upgrade to continue.
                    </span>
                  ) : (
                    <>
                      Your free trial ends on{" "}
                      <span className="font-medium text-blue-600">{currentPeriodEnd}</span>.
                    </>
                  )
                ) : (
                  <span className="font-medium text-blue-600">Your subscription renews monthly.</span>
                )}
              </p>

            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              You&rsquo;re on the {formatPlanName(subscription?.plan)} plan.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Payment method
                </p>
                {paymentMethod ? (
                  <div className="mt-1 text-sm text-slate-700">
                    <p className="font-medium">
                      {(paymentMethod.brand?.toUpperCase() ?? 'CARD')} •••• {paymentMethod.last4}
                    </p>
                    <p className="text-xs text-slate-500">
                      Expires{' '}
                      {paymentMethod.expMonth && paymentMethod.expYear
                        ? `${paymentMethod.expMonth.toString().padStart(2, '0')}/${paymentMethod.expYear}`
                        : '--/--'}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">No card on file.</p>
                )}
              </div>
              <button
                onClick={handleChangeCard}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                {paymentMethod ? 'Change card' : 'Add card'}
              </button>
            </div>

            {cardFlow && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
                {cardFlow.mode === 'plan' ? (
                  <p className="text-sm text-slate-600">
                    Enter a card to upgrade to the {formatPlanName(cardFlow.targetPlan)} plan.
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">Enter your new card details.</p>
                )}

                {stripeEnabled && stripePromise ? (
                  <>
                    <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-4">
                      {isPreparingPaymentElement && (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                            <p className="text-sm text-slate-500">Preparing secure payment form…</p>
                          </div>
                        </div>
                      )}
                      {clientSecret && (
                        <div className={`transition-opacity duration-300 ${isPreparingPaymentElement ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
                          <PaymentElementWrapper
                            stripePromise={stripePromise}
                            clientSecret={clientSecret}
                            onReady={(readyStripe, readyElements) => {
                              setPaymentStripe(readyStripe);
                              setPaymentElements(readyElements);
                            }}
                            onElementReady={() => {
                              setIsPreparingPaymentElement(false);
                            }}
                          />
                        </div>
                      )}
                      {!isPreparingPaymentElement && !clientSecret && (
                        <p className="text-sm text-slate-500">
                          Secure payment form will appear once Stripe is ready. Please wait a moment.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => void handleCardFlowSubmit()}
                        disabled={
                          actionLoading ||
                          isPreparingPaymentElement ||
                          !paymentStripe ||
                          !paymentElements ||
                          !clientSecret
                        }
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        {actionLoading ? 'Saving…' : cardFlow.mode === 'plan' ? 'Confirm & pay' : 'Save card'}
                      </button>
                      <button
                        onClick={closeCardFlow}
                        disabled={actionLoading}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Stripe is not configured yet. Please contact the VentureStrat team to update your card.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="mt-12 space-y-5">
        <h3 className="text-xl font-semibold text-slate-900">Available plans</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {availablePlans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isSelected = plan.id === selectedPlan;
            const isHighlighted = plan.id === 'PRO';

            const borderClass = isHighlighted
              ? 'border-amber-400 shadow-lg shadow-amber-100'
              : isCurrent
              ? 'border-blue-400 shadow-md shadow-blue-100'
              : 'border-slate-200';

            const accentClasses = {
              FREE: {
                header: 'bg-slate-50',
                button: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
                badge: 'bg-slate-200 text-slate-600',
              },
              STARTER: {
                header: 'bg-indigo-50',
                button: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
                badge: 'bg-indigo-100 text-indigo-700',
              },

              PRO: {
                header: 'bg-amber-50',
                button: 'bg-amber-500 text-white hover:bg-amber-600',
                badge: 'bg-amber-500 text-white',
              },
              SCALE: {
                header: 'bg-emerald-50',
                button: 'bg-emerald-500 text-white hover:bg-emerald-600',
                badge: 'bg-emerald-500 text-white',
              },
            } as const;

            const accent = accentClasses[plan.id];

            return (
              <div
                key={plan.id}
                className={`flex h-full flex-col rounded-3xl border bg-white p-0 transition-shadow ${borderClass}`}
              >
                <div className={`rounded-t-3xl px-6 py-6 ${accent.header}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-900">{plan.name}</h4>
                    {plan.badge && (
                      <span className={`${accent.badge} rounded-full px-3 py-1 text-xs font-semibold uppercase`}>
                        {plan.badge}
                      </span>
                    )}
                    {!plan.badge && isCurrent && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Current
                      </span>
                    )}
                    {!plan.badge && isSelected && !isCurrent && (
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-semibold text-slate-900">{plan.price}</p>
                    <p className="mt-1 text-sm text-slate-600">{plan.headline}</p>
                    <p className="mt-2 text-sm text-slate-500">{plan.subheading}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-5 px-6 py-6">
                  {plan.featureGroups.map((group) => (
                    <div key={group.title} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {group.title}
                      </p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        {group.items.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => void handlePlanChange(plan.id)}
                  disabled={isCurrent || actionLoading}
                  className={`mx-6 mb-6 mt-auto w-auto rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                    isCurrent ? 'cursor-not-allowed bg-slate-200 text-slate-500' : accent.button
                  }`}
                >
                  {isCurrent
                    ? 'Current plan'
                    : actionLoading && isSelected
                    ? 'Processing…'
                    : 'Choose plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function SubscriptionPage() {
  const stripePromise = useMemo(() => getStripe(), []);
  return <PlanManager stripePromise={stripePromise} />;
}
