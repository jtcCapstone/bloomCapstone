import React, { useEffect, useContext, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import Markdown from "markdown-to-jsx"
import { ReviewOrderTypeEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import { t, Form } from "@bloom-housing/ui-components"
import { OnClientSide, PageView, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import FormsLayout from "../../../layouts/forms"
import { useFormConductor } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"
import ApplicationFormLayout from "../../../layouts/application-form"
import { Button } from "@bloom-housing/ui-seeds"
import { AssistantOpenButton } from "../../../components/assistant/types"
import Assistant from "../../../components/assistant/General/Assistant"
import styles from "../../../layouts/application-form.module.scss"

const ApplicationWhatToExpect = () => {
  const { profile } = useContext(AuthContext)
  const { conductor, listing } = useFormConductor("whatToExpect")
  const router = useRouter()
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [isChatbotMinimized, setIsChatbotMinimized] = useState(false)

  const { handleSubmit } = useForm()
  const onSubmit = () => {
    conductor.routeToNextOrReturnUrl()
  }

  const content = useMemo(() => {
    switch (listing?.reviewOrderType) {
      case ReviewOrderTypeEnum.firstComeFirstServe:
        return {
          steps: t("application.start.whatToExpect.fcfs.steps"),
          finePrint: t("application.start.whatToExpect.fcfs.finePrint"),
        }
      case ReviewOrderTypeEnum.lottery:
        return {
          steps: t("application.start.whatToExpect.lottery.steps"),
          finePrint: t("application.start.whatToExpect.lottery.finePrint"),
        }
      case ReviewOrderTypeEnum.waitlist:
        return {
          steps: t("application.start.whatToExpect.waitlist.steps"),
          finePrint: t("application.start.whatToExpect.waitlist.finePrint"),
        }
      default:
        return { steps: "", finePrint: "" }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, router.locale])

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - What to Expect",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <>
      {isChatbotOpen && (
        <Assistant
          isOpen={isChatbotOpen}
          onClose={() => {
            setIsChatbotOpen(false)
            setIsChatbotMinimized(true)
          }}
        />
      )}

      {isChatbotMinimized && (
        <button
          type="button"
          className={styles["assistant-reopen-button"]}
          onClick={() => {
            setIsChatbotOpen(true)
            setIsChatbotMinimized(false)
          }}
        >
          💬 Assistant Help - Click to Reopen
        </button>
      )}

      <FormsLayout>
        <ApplicationFormLayout
          listingName={listing?.name}
          heading={
            <div className={styles["heading-with-assistant"]}>
              <h2>{t("application.start.whatToExpect.title")}</h2>
              {!isChatbotOpen && !isChatbotMinimized && (
                <AssistantOpenButton
                  onClick={() => {
                    setIsChatbotOpen(true)
                    setIsChatbotMinimized(false)
                  }}
                />
              )}
            </div>
          }
          progressNavProps={{
            currentPageSection: 1,
            completedSections: 0,
            labels: conductor.config.sections.map((label) => t(`t.${label}`)),
            mounted: OnClientSide(),
          }}
          backLink={{
            url: listing?.includeCommunityDisclaimer
              ? conductor.determinePreviousUrl()
              : `/applications/start/choose-language?listingId=${listing?.id}`,
          }}
        >
          <CardSection>
            <div className="markdown">
              <Markdown
                options={{
                  disableParsingRawHTML: true,
                  overrides: {
                    ol: {
                      component: ({ children, ...props }) => (
                        <ol {...props} className="large-numbers">
                          {children}
                        </ol>
                      ),
                    },
                  },
                }}
              >
                {content.steps}
              </Markdown>

              <Markdown
                options={{
                  disableParsingRawHTML: true,
                  overrides: {
                    li: {
                      component: ({ children, ...props }) => (
                        <li {...props} className="mb-5">
                          {children}
                        </li>
                      ),
                    },
                  },
                }}
              >
                {content.finePrint}
              </Markdown>
            </div>
          </CardSection>
          <CardSection className={"bg-primary-lighter"}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Button
                type="submit"
                variant="primary"
                onClick={() => conductor.setNavigatedBack(false)}
                id={"app-next-step-button"}
              >
                {t("t.next")}
              </Button>
            </Form>
          </CardSection>
        </ApplicationFormLayout>
      </FormsLayout>
    </>
  )
}

export default ApplicationWhatToExpect
