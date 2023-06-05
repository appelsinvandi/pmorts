import { Box, Text } from 'ink'
import React from 'react'
import { AppLeft } from './appLeft.tsx'
import { AppRight } from './appRight.tsx'
import { useStdoutDimensions } from '../hooks/index.mts'

export const App: React.FC = () => {
  const [, rows] = useStdoutDimensions()

  return (
    <Box width="100%" height={rows - 1} flexDirection="row">
      <TitledBox title="Choices">
        <AppLeft />
      </TitledBox>
      <TitledBox title="Queue">
        <AppRight />
      </TitledBox>
    </Box>
  )
}

const TitledBox: React.FC<{ title: string } & React.PropsWithChildren> = ({
  title,
  children,
}) => (
  <Box borderStyle="single" flexBasis={1} flexGrow={1} position="relative">
    <Box
      position="absolute"
      marginTop={-1}
      width="100%"
      flexDirection="row"
      justifyContent="center"
    >
      <Text>&nbsp;{title}&nbsp;</Text>
    </Box>
    {children}
  </Box>
)
