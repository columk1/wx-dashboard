import Spinner from '@/app/ui/Spinner/Spinner'
import styles from './Loading.module.css'

const Loading = () => {
  return (
    <div className={styles.loading}>
      <Spinner />
    </div>
  )
}

export default Loading
