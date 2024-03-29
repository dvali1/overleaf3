import type { ElementType } from 'react'
import { useTranslation } from 'react-i18next'
import importOverleafModules from '../../../../macros/import-overleaf-module.macro'
import { BinaryFile } from '../types/binary-file'

type FileViewRefreshErrorProps = {
  file: BinaryFile
  refreshError: string
}

const tprFileViewRefreshError = importOverleafModules(
  'tprFileViewRefreshError'
) as {
  import: { TPRFileViewRefreshError: ElementType }
  path: string
}[]

export default function FileViewRefreshError({
  file,
  refreshError,
}: FileViewRefreshErrorProps) {
  const { t } = useTranslation()

  if (tprFileViewRefreshError.length > 0) {
    return tprFileViewRefreshError.map(
      ({ import: { TPRFileViewRefreshError }, path }) => (
        <TPRFileViewRefreshError
          key={path}
          file={file}
          refreshError={refreshError}
        />
      )
    )[0]
  } else {
    return (
      <div className="row">
        <br />
        <div className="alert alert-danger col-md-6 col-md-offset-3">
          {t('access_denied')}: {refreshError}
        </div>
      </div>
    )
  }
}
