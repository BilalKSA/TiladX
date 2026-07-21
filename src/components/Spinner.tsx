import './Spinner.css'

function Spinner({ size = 16 }: { size?: number }) {
  return <span className="tld-spinner" style={{ width: size, height: size }} aria-hidden="true" />
}

export default Spinner
