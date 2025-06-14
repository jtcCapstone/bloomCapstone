import React, { useContext, useEffect } from "react"
import { useForm } from "react-hook-form"
import { FieldGroup, Form, t } from "@bloom-housing/ui-components"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { Alert } from "@bloom-housing/ui-seeds"
import {
  createUnitTypeId,
  getUniqueUnitTypes,
  OnClientSide,
  PageView,
  pushGtmEvent,
  AuthContext,
} from "@bloom-housing/shared-helpers"
import { useFormConductor } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"
import ApplicationFormLayout from "../../../layouts/application-form"
import FormsLayout from "../../../layouts/forms"
import styles from "../../../layouts/application-form.module.scss"
import { AssistantOpenButton } from "../../../components/assistant/types"
import Assistant from "../../../components/assistant/General/Assistant"

const ApplicationPreferredUnits = () => {
  const { profile } = useContext(AuthContext)
  const { conductor, application, listing } = useFormConductor("preferredUnitSize")
  const currentPageSection = 2
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false)
  const [isChatbotMinimized, setIsChatbotMinimized] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, trigger } = useForm()

  const onSubmit = async (data) => {
    const validation = await trigger()
    if (!validation) return
    const { preferredUnit } = data

    // save units always as an array (when is only one option, react-hook-form stores an option as string)
    if (Array.isArray(preferredUnit)) {
      application.preferredUnitTypes = createUnitTypeId(preferredUnit)
    } else {
      application.preferredUnitTypes = createUnitTypeId([preferredUnit])
    }

    conductor.sync()
    conductor.routeToNextOrReturnUrl()
  }
  const onError = () => {
    window.scrollTo(0, 0)
  }

  const unitTypes = getUniqueUnitTypes(listing?.units)

  const preferredUnitOptions = unitTypes?.map((item) => ({
    id: item.id,
    label: t(`application.household.preferredUnit.options.${item.name}`),
    value: item.id,
    defaultChecked: !!application.preferredUnitTypes?.find((unit) => unit.id === item.id),
    dataTestId: t(`application.household.preferredUnit.options.${item.name}`),
  }))

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Preferred Unit Size",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <FormsLayout>
      <>
        {isChatbotOpen && (
          <Assistant
            isOpen={isChatbotOpen}
            onClose={() => {
              setIsChatbotOpen(false)
              setIsChatbotMinimized(false)
            }}
          />
        )}
        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <ApplicationFormLayout
            listingName={listing?.name}
            heading={
              <div className={styles["heading-with-assistant"]}>
                <h2>{t("application.household.preferredUnit.title")}</h2>
                {!isChatbotOpen && !isChatbotMinimized && (
                  <AssistantOpenButton onClick={() => setIsChatbotOpen(true)} />
                )}
              </div>
            }
            subheading={t("application.household.preferredUnit.subTitle")}
            progressNavProps={{
              currentPageSection: currentPageSection,
              completedSections: application.completedSections,
              labels: conductor.config.sections.map((label) => t(`t.${label}`)),
              mounted: OnClientSide(),
            }}
            backLink={{
              url: conductor.determinePreviousUrl(),
            }}
            conductor={conductor}
          >
            {Object.entries(errors).length > 0 && (
              <Alert
                className={styles["message-inside-card"]}
                variant="alert"
                fullwidth
                id={"application-alert-box"}
              >
                {t("errors.errorsToResolve")}
              </Alert>
            )}

            <CardSection divider={"flush"} className={"border-none"}>
              <fieldset>
                <legend className="sr-only">
                  {t("application.household.preferredUnit.legend")}
                </legend>
                <FieldGroup
                  type="checkbox"
                  fieldGroupClassName="grid grid-cols-1"
                  fieldClassName="ml-0"
                  name="preferredUnit"
                  groupNote={t("application.household.preferredUnit.optionsLabel")}
                  fields={preferredUnitOptions}
                  error={!!errors.preferredUnit}
                  errorMessage={t("errors.selectAtLeastOne")}
                  validation={{ required: true }}
                  register={register}
                  dataTestId={"app-preferred-units"}
                />
              </fieldset>
            </CardSection>
          </ApplicationFormLayout>
        </Form>
      </>
    </FormsLayout>
  )
}

export default ApplicationPreferredUnits
